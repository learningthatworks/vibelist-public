import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hcaptchaSecret = Deno.env.get("HCAPTCHA_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(255),
  productName: z.string().max(200).optional(),
  requestType: z.enum(["edit_request", "new_product", "general", "report"]),
  message: z.string().trim().min(1).max(2000),
  captchaToken: z.string().min(1),
});

interface ContactRequest {
  name: string;
  email: string;
  productName?: string;
  requestType: string;
  message: string;
  captchaToken: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();

    // Validate input with zod
    const validatedData = contactSchema.parse(rawData);
    const { name, email, productName, requestType, message, captchaToken } = validatedData;

    console.log("Contact request received:", { name, email, requestType, productName });

    // Verify hCaptcha token
    const captchaVerifyUrl = "https://hcaptcha.com/siteverify";
    const captchaResponse = await fetch(captchaVerifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${hcaptchaSecret}&response=${captchaToken}`,
    });

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      console.error("CAPTCHA verification failed:", captchaResult);
      return new Response(JSON.stringify({ error: "CAPTCHA verification failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("CAPTCHA verification successful");

    const emailResponse = await resend.emails.send({
      from: "VibeApps Directory <noreply@metability.ai>",
      to: ["svaitkus@gmail.com"],
      replyTo: email,
      subject: `[VibeApps] ${requestType}${productName ? ` - ${productName}` : ""}`,
      html: `
        <h2>New Contact Request from VibeApps Directory</h2>
        <p><strong>Request Type:</strong> ${escapeHtml(requestType)}</p>
        ${productName ? `<p><strong>Product Name:</strong> ${escapeHtml(productName)}</p>` : ""}
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <hr />
        <h3>Message:</h3>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">This message was sent from the VibeApps Directory contact form.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);

    // Handle zod validation errors
    if (error.name === "ZodError") {
      return new Response(JSON.stringify({ error: "Invalid input data", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
