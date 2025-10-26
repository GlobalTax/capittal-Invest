import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password } = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('Admin auth attempt:', { email, ipAddress });

    // 1. Verificar rate limit
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_login_rate_limit', {
        p_email: email,
        p_ip_address: ipAddress,
        p_max_attempts: 5,
        p_window_minutes: 15
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (rateLimitCheck && !rateLimitCheck.allowed) {
      console.log('Rate limit exceeded for:', email);
      
      // Registrar intento bloqueado
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_ip_address: ipAddress,
        p_success: false,
        p_user_agent: userAgent
      });

      return new Response(
        JSON.stringify({
          error: 'Too many failed attempts. Please try again later.',
          lockout_until: rateLimitCheck.lockout_until,
          remaining_attempts: 0
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('Authentication failed:', authError.message);
      
      // Registrar intento fallido
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_ip_address: ipAddress,
        p_success: false,
        p_user_agent: userAgent
      });

      return new Response(
        JSON.stringify({
          error: 'Invalid credentials',
          remaining_attempts: rateLimitCheck?.remaining_attempts || 0
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verificar que es admin usando función server-side
    const { data: adminData, error: adminError } = await supabase
      .rpc('get_admin_user_info', { check_user_id: authData.user.id });

    if (adminError || !adminData || adminData.length === 0) {
      console.log('Not an admin user:', email);
      
      // Log intento de acceso no autorizado
      await supabase.from('security_events').insert({
        event_type: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
        severity: 'high',
        user_id: authData.user.id,
        ip_address: ipAddress,
        details: {
          email,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        },
      });

      // Registrar intento fallido
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_ip_address: ipAddress,
        p_success: false,
        p_user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ error: 'Access denied: Not an admin user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminUser = adminData[0];

    // Verificar si está activo
    if (!adminUser.is_active) {
      console.log('Admin user is inactive:', email);
      
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_ip_address: ipAddress,
        p_success: false,
        p_user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ error: 'Account disabled. Contact administrator.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Actualizar last_login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', authData.user.id);

    // 5. Log acceso exitoso
    await supabase.from('security_events').insert({
      event_type: 'ADMIN_LOGIN_SUCCESS',
      severity: 'info',
      user_id: authData.user.id,
      ip_address: ipAddress,
      details: {
        email: adminUser.email,
        role: adminUser.role,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      },
    });

    // 6. Registrar intento exitoso
    await supabase.rpc('log_login_attempt', {
      p_email: email,
      p_ip_address: ipAddress,
      p_success: true,
      p_user_agent: userAgent
    });

    console.log('Admin login successful:', email);

    return new Response(
      JSON.stringify({
        session: authData.session,
        adminUser: {
          id: adminUser.id,
          user_id: adminUser.user_id,
          email: adminUser.email,
          full_name: adminUser.full_name,
          role: adminUser.role,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Admin auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
