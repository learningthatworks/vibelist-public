import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const voteSchema = z.object({
  product_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5)
});

// Simple in-memory rate limiter
// In production, consider using a Supabase table or Redis for persistent storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 10 votes per hour per IP
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: Request): string {
  // Try various headers in order of preference
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  
  // Fallback to connection info (may not be available in all environments)
  return req.headers.get('cf-connecting-ip') || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
    // No entry or expired, create new window
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  // Increment count
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetTime: entry.resetTime };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(req);
    console.log('Vote request from IP:', clientIp);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    const rateLimitHeaders = {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
    };
    
    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Too many votes from your IP address.',
          retryAfter: new Date(rateLimit.resetTime).toISOString()
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders,
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get or create anon_id from cookie
    const cookies = req.headers.get('cookie') || '';
    let anonId = cookies.split(';')
      .find(c => c.trim().startsWith('anon_id='))
      ?.split('=')[1];

    if (!anonId) {
      anonId = crypto.randomUUID();
    }

    // Parse and validate request body
    const body = await req.json();
    
    let validatedData;
    try {
      validatedData = voteSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input data',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      throw error;
    }

    const { product_id, rating } = validatedData;

    console.log('Valid vote submission:', { product_id, rating, anonId, ip: clientIp });

    // Insert vote (unique constraint will prevent duplicates)
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .insert({
        product_id: product_id,
        anon_id: anonId,
        rating: rating
      })
      .select()
      .single();

    if (voteError) {
      console.error('Vote error:', voteError);
      
      // Handle duplicate vote
      if (voteError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'You have already voted for this product' }),
          { 
            status: 409,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to submit vote. Please try again.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Vote inserted successfully:', voteData);

    // Set httpOnly cookie with anon_id
    const cookieHeader = `anon_id=${anonId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;

    return new Response(
      JSON.stringify({ success: true, vote: voteData }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});