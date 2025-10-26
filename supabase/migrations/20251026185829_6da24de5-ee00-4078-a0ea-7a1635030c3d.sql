-- ============================================
-- FASE 1: Funciones de Seguridad Server-Side
-- ============================================

-- Función para verificar si un usuario tiene un rol específico (con jerarquía)
CREATE OR REPLACE FUNCTION public.has_role(
  check_user_id uuid,
  required_role admin_role
) RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role admin_role;
  role_hierarchy_map jsonb := '{
    "super_admin": 4,
    "admin": 3,
    "editor": 2,
    "viewer": 1
  }'::jsonb;
BEGIN
  -- Obtener el rol del usuario
  SELECT role INTO user_role
  FROM public.admin_users
  WHERE user_id = check_user_id
    AND is_active = true
  LIMIT 1;
  
  -- Si no tiene rol, retornar false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar jerarquía: el rol del usuario debe ser >= al requerido
  RETURN (role_hierarchy_map->user_role::text)::int >= (role_hierarchy_map->required_role::text)::int;
END;
$$;

-- Función helper para obtener información completa del admin
CREATE OR REPLACE FUNCTION public.get_admin_user_info(check_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  role admin_role,
  is_active boolean,
  last_login timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    user_id,
    email,
    full_name,
    role,
    is_active,
    last_login
  FROM public.admin_users
  WHERE user_id = check_user_id
    AND is_active = true
  LIMIT 1;
$$;

-- ============================================
-- FASE 2: Rate Limiting y Logging
-- ============================================

-- Tabla para rate limiting de intentos de login
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempted_at);

-- Habilitar RLS en login_attempts (solo admins pueden ver)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::admin_role));

-- Función para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  p_email text,
  p_ip_address inet,
  p_max_attempts int DEFAULT 5,
  p_window_minutes int DEFAULT 15
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count int;
  lockout_until timestamptz;
BEGIN
  -- Contar intentos fallidos en la ventana de tiempo
  SELECT COUNT(*) INTO attempt_count
  FROM public.login_attempts
  WHERE email = p_email
    AND ip_address = p_ip_address
    AND success = false
    AND attempted_at > now() - (p_window_minutes || ' minutes')::interval;
  
  -- Si excede el límite, registrar evento de seguridad
  IF attempt_count >= p_max_attempts THEN
    lockout_until := now() + (p_window_minutes || ' minutes')::interval;
    
    PERFORM public.log_security_event(
      'LOGIN_RATE_LIMIT_EXCEEDED',
      'high',
      'login_attempts',
      'check_rate_limit',
      jsonb_build_object(
        'email', p_email,
        'ip_address', p_ip_address,
        'attempt_count', attempt_count,
        'lockout_until', lockout_until
      )
    );
    
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining_attempts', 0,
      'lockout_until', lockout_until
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_attempts', p_max_attempts - attempt_count,
    'lockout_until', null
  );
END;
$$;

-- Función para registrar intento de login
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email text,
  p_ip_address inet,
  p_success boolean,
  p_user_agent text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, ip_address, success, user_agent)
  VALUES (p_email, p_ip_address, p_success, p_user_agent);
  
  -- Limpiar intentos antiguos (más de 24 horas)
  DELETE FROM public.login_attempts
  WHERE attempted_at < now() - INTERVAL '24 hours';
END;
$$;

-- ============================================
-- FASE 3: Gestión de Usuarios Admin
-- ============================================

-- Función para crear un nuevo usuario admin (solo super_admin)
CREATE OR REPLACE FUNCTION public.create_admin_user_record(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_role admin_role DEFAULT 'editor'::admin_role
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario actual es super_admin
  IF NOT public.has_role(auth.uid(), 'super_admin'::admin_role) THEN
    RAISE EXCEPTION 'Solo los super administradores pueden crear usuarios admin';
  END IF;
  
  -- Insertar nuevo admin user
  INSERT INTO public.admin_users (user_id, email, full_name, role, is_active)
  VALUES (p_user_id, p_email, p_full_name, p_role, true);
  
  -- Log del evento
  PERFORM public.log_security_event(
    'ADMIN_USER_CREATED',
    'high',
    'admin_users',
    'INSERT',
    jsonb_build_object(
      'created_user_email', p_email,
      'created_user_role', p_role,
      'created_by', auth.uid()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'email', p_email
  );
END;
$$;

-- Función para actualizar rol de admin (solo super_admin)
CREATE OR REPLACE FUNCTION public.update_admin_user_role(
  p_user_id uuid,
  p_new_role admin_role
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role admin_role;
BEGIN
  -- Verificar que el usuario actual es super_admin
  IF NOT public.has_role(auth.uid(), 'super_admin'::admin_role) THEN
    RAISE EXCEPTION 'Solo los super administradores pueden modificar roles';
  END IF;
  
  -- No permitir que se modifique a sí mismo
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes modificar tu propio rol';
  END IF;
  
  -- Obtener rol anterior
  SELECT role INTO old_role FROM public.admin_users WHERE user_id = p_user_id;
  
  -- Actualizar rol
  UPDATE public.admin_users
  SET role = p_new_role, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log del evento
  PERFORM public.log_security_event(
    'ADMIN_USER_ROLE_CHANGED',
    'high',
    'admin_users',
    'UPDATE',
    jsonb_build_object(
      'target_user_id', p_user_id,
      'old_role', old_role,
      'new_role', p_new_role,
      'changed_by', auth.uid()
    )
  );
  
  RETURN true;
END;
$$;

-- Función para desactivar admin user (solo super_admin)
CREATE OR REPLACE FUNCTION public.deactivate_admin_user(
  p_user_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario actual es super_admin
  IF NOT public.has_role(auth.uid(), 'super_admin'::admin_role) THEN
    RAISE EXCEPTION 'Solo los super administradores pueden desactivar usuarios';
  END IF;
  
  -- No permitir que se desactive a sí mismo
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes desactivarte a ti mismo';
  END IF;
  
  -- Desactivar usuario
  UPDATE public.admin_users
  SET is_active = false, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log del evento
  PERFORM public.log_security_event(
    'ADMIN_USER_DEACTIVATED',
    'high',
    'admin_users',
    'UPDATE',
    jsonb_build_object(
      'target_user_id', p_user_id,
      'deactivated_by', auth.uid()
    )
  );
  
  RETURN true;
END;
$$;

-- Comentarios para documentación
COMMENT ON FUNCTION public.has_role IS 'Verifica si un usuario tiene un rol específico con jerarquía. SECURITY DEFINER para bypass RLS.';
COMMENT ON FUNCTION public.get_admin_user_info IS 'Obtiene información completa del usuario admin de forma segura.';
COMMENT ON FUNCTION public.check_login_rate_limit IS 'Verifica y controla rate limiting de intentos de login.';
COMMENT ON TABLE public.login_attempts IS 'Registro de intentos de login para rate limiting y auditoría.';