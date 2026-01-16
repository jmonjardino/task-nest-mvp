-- Fix RLS policies blocking users from viewing their own profiles
-- This is the root cause of "Sem Empresa Associada" error

-- Drop all existing SELECT policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view pending member profiles" ON public.profiles;

-- Policy 1: Users can ALWAYS view their own profile
-- This is the most important policy and must work for everyone
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view profiles in their company  
CREATE POLICY "Admins can view profiles in their company"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
  AND company_id IS NOT NULL
  AND company_id = (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy 3: Admins can view pending member profiles
CREATE POLICY "Admins can view pending member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
  AND EXISTS (
    SELECT 1 FROM public.company_members cm
    INNER JOIN public.profiles admin_profile ON admin_profile.id = auth.uid()
    WHERE cm.user_id = profiles.id
    AND cm.company_id = admin_profile.company_id
    AND cm.status = 'pending'
  )
);
