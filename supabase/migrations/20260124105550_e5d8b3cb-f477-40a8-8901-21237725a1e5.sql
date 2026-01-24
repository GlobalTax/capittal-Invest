-- Step 1: Create new SECURITY DEFINER functions that bypass RLS
-- These functions run with the privileges of the function owner, not the caller

CREATE OR REPLACE FUNCTION public.check_is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = check_user_id 
      AND is_active = true
      AND role IN ('super_admin', 'admin', 'editor', 'viewer')
  );
$$;

CREATE OR REPLACE FUNCTION public.check_is_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = check_user_id 
      AND is_active = true
      AND role = 'super_admin'
  );
$$;

-- Step 2: Drop ALL existing SELECT policies on admin_users to avoid conflicts
DROP POLICY IF EXISTS "Admins can view own profile or super_admin sees all" ON public.admin_users;
DROP POLICY IF EXISTS "SECURE_admin_users_select" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_policy" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can read own data" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can read all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_own_or_super_admin" ON public.admin_users;

-- Step 3: Create a single, non-recursive SELECT policy
CREATE POLICY "admin_users_select_own_or_super_admin"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  -- User can see their own record
  user_id = auth.uid()
  OR
  -- Or is super_admin (using SECURITY DEFINER function - no recursion)
  public.check_is_super_admin(auth.uid())
);

-- Step 4: Update existing wrapper functions to use the new secure versions
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.check_is_admin(check_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_user_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.check_is_super_admin(check_user_id);
$$;