import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').filter(Boolean);
const VALID_ROLES = ['super_admin', 'admin', 'editor', 'viewer'];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Validar que el rol es válido
    if (!VALID_ROLES.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }),
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
      console.error('Failed to create auth user:', createError.message);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear registro en admin_users usando función segura
    const { error: adminError } = await supabase
      .rpc('create_admin_user_record', {
        p_user_id: newUser.user.id,
        p_email: email,
        p_full_name: full_name,
        p_role: role
      });

    if (adminError) {
      console.error('Failed to create admin record:', adminError.message);

      // Rollback: eliminar usuario de auth
      await supabase.auth.admin.deleteUser(newUser.user.id);

      return new Response(
        JSON.stringify({ error: 'Failed to create admin record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email,
          full_name,
          role,
          temporary_password: send_invite ? null : tempPassword
        },
        message: send_invite
          ? 'User created. Invitation email sent.'
          : 'User created. Share the temporary password securely.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Create admin user error:', message);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSecurePassword(): string {
  const length = 16;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*';
  const charset = lowercase + uppercase + digits + special;

  // Ensure at least one character from each category using rejection sampling
  const array = new Uint8Array(length * 2);
  crypto.getRandomValues(array);

  const chars: string[] = [];
  let idx = 0;

  // Pick one from each required category at random positions
  const required = [lowercase, uppercase, digits, special];
  for (const pool of required) {
    chars.push(pool[array[idx++] % pool.length]);
  }

  // Fill remaining positions
  while (chars.length < length) {
    chars.push(charset[array[idx++] % charset.length]);
  }

  // Shuffle using Fisher-Yates with crypto random
  const shuffleArray = new Uint8Array(chars.length);
  crypto.getRandomValues(shuffleArray);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleArray[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
