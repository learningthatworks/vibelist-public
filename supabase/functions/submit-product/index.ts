import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const submissionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name too long"),
  url: z.string().trim().url("Invalid URL").max(500, "URL too long").optional().or(z.literal('')),
  category_type: z.string().trim().min(1, "Category is required"),
  db_fit: z.string().trim().min(1, "Database fit is required"),
  deploy_path: z.string().trim().max(200, "Deploy path too long").optional().or(z.literal('')),
  pricing_model: z.string().trim().max(100, "Pricing model too long").optional().or(z.literal('')),
  tags: z.string().trim().max(500, "Tags too long").optional().or(z.literal('')),
  use_case_category: z.string().trim().max(200, "Use case too long").optional().or(z.literal('')),
  overview_short: z.string().trim().max(1000, "Overview too long").optional().or(z.literal('')),
  pros_short: z.string().trim().max(1000, "Pros too long").optional().or(z.literal('')),
  cons_short: z.string().trim().max(1000, "Cons too long").optional().or(z.literal('')),
  submitter_email: z.string().trim().email("Invalid email").max(255, "Email too long").optional().or(z.literal('')),
  submitter_notes: z.string().trim().max(2000, "Notes too long").optional().or(z.literal('')),
  oss: z.boolean(),
  first_class_neon: z.boolean(),
  first_class_supabase: z.boolean(),
  designer_first: z.boolean(),
  enterprise_ready: z.boolean(),
  byo_postgres: z.boolean(),
  ai_builder: z.boolean(),
  difficulty_hint: z.number().int().min(0).max(10).optional(),
  complexity_hint: z.number().int().min(0).max(10).optional(),
  captcha_token: z.string().min(1, "CAPTCHA verification required"),
});

// Rate limiting: 10 submissions per hour per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') ||
         'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: record.resetTime };
}

async function verifyHCaptcha(token: string, secret: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const result = await response.json();
    console.log('hCaptcha verification result:', { success: result.success, errorCodes: result['error-codes'] });
    
    if (!result.success) {
      return { success: false, error: result['error-codes']?.join(', ') || 'CAPTCHA verification failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return { success: false, error: 'CAPTCHA verification service error' };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = getClientIp(req);
  console.log('Product submission request from IP:', clientIp);

  try {
    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      console.log('Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ 
          error: 'Too many submissions. Please try again later.',
          retryAfter 
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = submissionSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('Validation error:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationResult.error.flatten().fieldErrors 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = validationResult.data;

    // Verify CAPTCHA server-side
    const hcaptchaSecret = Deno.env.get('HCAPTCHA_SECRET');
    if (!hcaptchaSecret) {
      console.error('HCAPTCHA_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const captchaResult = await verifyHCaptcha(data.captcha_token, hcaptchaSecret);
    if (!captchaResult.success) {
      console.log('CAPTCHA verification failed:', captchaResult.error);
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed. Please try again.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role for database insertion
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate submissions (same name)
    const { data: existingProduct, error: checkError } = await supabase
      .from('product_submissions')
      .select('id, name')
      .ilike('name', data.name)
      .limit(1)
      .single();

    if (existingProduct) {
      console.log('Duplicate submission detected:', data.name);
      return new Response(
        JSON.stringify({ 
          error: 'A product with this name has already been submitted.' 
        }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Remove captcha_token before inserting (don't store it)
    const { captcha_token, ...submissionData } = data;

    // Insert into database
    const { data: insertedData, error: insertError } = await supabase
      .from('product_submissions')
      .insert([submissionData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit product. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Product submission successful:', { id: insertedData.id, name: insertedData.name });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Product submitted successfully!',
        id: insertedData.id 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );

  } catch (error) {
    console.error('Unexpected error in submit-product function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
