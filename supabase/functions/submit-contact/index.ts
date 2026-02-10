import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || 'https://capittal-invest.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

// Escape HTML to prevent XSS in emails
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Email service stub
async function sendEmailStub(to: string, subject: string, html: string): Promise<{ success: boolean }> {
  console.log('[EMAIL STUB] Sending email:', { to, subject });
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
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
      console.log('[RATE LIMIT] Exceeded for:', email);
      
      // Log security event
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

    // Extract IP address and user agent
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Map subject to service_type
    const serviceType = mapSubjectToServiceType(subject);

    console.log('[CONTACT] Processing submission:', { email, company, subject, serviceType });

    // Insert into contact_leads table
    const { data: contactLead, error: insertError } = await supabase
      .from('contact_leads')
      .insert({
        full_name: name,
        email: email,
        company: company,
        service_type: serviceType,
        referral: message, // Store message in referral field
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

    console.log('[CONTACT] Lead created successfully:', contactLead.id);

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

    // Send confirmation email to user (stub)
    const safeName = escapeHtml(name);
    const safeMessage = escapeHtml(message);
    const safeCompany = escapeHtml(company);
    const safeSubject = escapeHtml(subject);
    const safeEmail = escapeHtml(email);

    await sendEmailStub(
      email,
      'Gracias por contactar con Capittal Invest',
      `
        <h1>Gracias por contactarnos, ${safeName}!</h1>
        <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
        <p><strong>Tu mensaje:</strong></p>
        <p>${safeMessage}</p>
        <p>Un saludo,<br>El equipo de Capittal Invest</p>
      `
    );

    // Send notification email to admin (stub)
    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'admin@capittal-invest.com';
    await sendEmailStub(
      adminEmail,
      `Nuevo contacto de ${safeName}`,
      `
        <h2>Nuevo formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Empresa:</strong> ${safeCompany}</p>
        <p><strong>Asunto:</strong> ${safeSubject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${safeMessage}</p>
        <hr>
        <p><small>IP: ${escapeHtml(ipAddress)} | User Agent: ${escapeHtml(userAgent)}</small></p>
      `
    );

    // Update email_sent status
    await supabase
      .from('contact_leads')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', contactLead.id);

    console.log('[CONTACT] Email stubs executed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact submission received successfully',
        id: contactLead.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[CONTACT] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
