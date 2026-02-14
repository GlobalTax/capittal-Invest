import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Email service stub
async function sendEmailStub(to: string, subject: string, html: string): Promise<{ success: boolean }> {
  // TODO: Integrate Resend API when ready
  return { success: true };
}

// Map form subjects to database service_type_enum
function mapSubjectToServiceType(subject: string): "vender" | "comprar" | "otros" {
  const mapping: Record<string, "vender" | "comprar" | "otros"> = {
    'investment': 'comprar',
    'partnership': 'otros',
    'press': 'otros',
    'careers': 'otros',
    'other': 'otros',
  };
  return mapping[subject] || 'otros';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { name, email, company, subject, message }: ContactFormData = await req.json();

    // Validate required fields
    if (!name || !email || !company || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limiting (10 requests per email per hour)
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc(
      'check_rate_limit_enhanced_safe',
      {
        p_identifier: email,
        p_category: 'contact_form',
        p_max_requests: 10,
        p_window_minutes: 60,
      }
    );

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (rateLimitOk === false) {
      await supabase.from('security_events').insert({
        event_type: 'RATE_LIMIT_EXCEEDED',
        severity: 'high',
        table_name: 'contact_leads',
        operation: 'INSERT',
        details: {
          email,
          category: 'contact_form',
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(
        JSON.stringify({
          error: 'Too many submissions. Please try again later.',
          retryAfter: 3600
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          }
        }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const serviceType = mapSubjectToServiceType(subject);

    // Insert into contact_leads table
    const { data: contactLead, error: insertError } = await supabase
      .from('contact_leads')
      .insert({
        full_name: name,
        email: email,
        company: company,
        service_type: serviceType,
        referral: message,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[CONTACT] Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save contact submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log security event for audit trail
    await supabase.from('security_events').insert({
      event_type: 'CONTACT_FORM_SUBMISSION',
      severity: 'info',
      table_name: 'contact_leads',
      operation: 'INSERT',
      details: {
        lead_id: contactLead.id,
        email,
        company,
        service_type: serviceType,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
      },
    });

    // Sanitize user input before inserting into HTML templates
    const safeName = escapeHtml(name);
    const safeMessage = escapeHtml(message);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const safeSubject = escapeHtml(subject);

    // Send confirmation email to user (stub)
    const emailSent = await sendEmailStub(
      email,
      'Thank you for contacting Capittal Invest',
      `
        <h1>Thank you for contacting us, ${safeName}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${safeMessage}</p>
        <p>Best regards,<br>The Capittal Invest Team</p>
      `
    );

    // Send notification email to admin (stub)
    await sendEmailStub(
      'admin@capittal-invest.com',
      `New contact submission from ${safeName}`,
      `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Company:</strong> ${safeCompany}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr>
        <p><small>IP: ${ipAddress} | User Agent: ${escapeHtml(userAgent)}</small></p>
      `
    );

    // Update email_sent status only if email was actually sent
    if (emailSent.success) {
      await supabase
        .from('contact_leads')
        .update({
          email_sent: false,
          email_sent_at: null,
        })
        .eq('id', contactLead.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact submission received successfully',
        id: contactLead.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CONTACT] Unexpected error:', message);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
