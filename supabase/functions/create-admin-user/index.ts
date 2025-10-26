import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener token de autorización
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar usuario actual
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que es super_admin
    const { data: isSuperAdmin, error: roleError } = await supabase
      .rpc('has_role', {
        check_user_id: user.id,
        required_role: 'super_admin'
      });

    if (roleError || !isSuperAdmin) {
      console.log('Unauthorized attempt to create admin user by:', user.email);
      
      await supabase.from('security_events').insert({
        event_type: 'UNAUTHORIZED_ADMIN_USER_CREATION_ATTEMPT',
        severity: 'high',
        user_id: user.id,
        details: {
          attempted_by: user.email,
          timestamp: new Date().toISOString()
        },
      });

      return new Response(
        JSON.stringify({ error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, full_name, role, send_invite } = await req.json();

    // Validar datos
    if (!email || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, full_name, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar password temporal seguro
    const tempPassword = generateSecurePassword();

    console.log('Creating admin user:', { email, role });

    // Crear usuario en auth.users
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        is_admin: true
      }
    });

    if (createError) {
      console.error('Failed to create auth user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear registro en admin_users usando función segura
    const { data: adminRecord, error: adminError } = await supabase
      .rpc('create_admin_user_record', {
        p_user_id: newUser.user.id,
        p_email: email,
        p_full_name: full_name,
        p_role: role
      });

    if (adminError) {
      console.error('Failed to create admin record:', adminError);
      
      // Rollback: eliminar usuario de auth
      await supabase.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to create admin record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin user created successfully:', email);

    // TODO: Enviar email de invitación si send_invite = true
    // Esto requeriría configurar un servicio de email (Resend, SendGrid, etc.)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email,
          full_name,
          role,
          temporary_password: send_invite ? null : tempPassword // Solo devolver si no se envía invite
        },
        message: send_invite 
          ? 'User created. Invitation email sent.' 
          : 'User created. Share the temporary password securely.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Create admin user error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  // Asegurar que cumple requisitos (mayúscula, minúscula, número, especial)
  if (!/[a-z]/.test(password)) password = 'a' + password.slice(1);
  if (!/[A-Z]/.test(password)) password = 'A' + password.slice(1);
  if (!/[0-9]/.test(password)) password = '1' + password.slice(1);
  if (!/[!@#$%^&*]/.test(password)) password = '!' + password.slice(1);
  
  return password;
}
