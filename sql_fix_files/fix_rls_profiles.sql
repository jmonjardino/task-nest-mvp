-- Fix RLS policies for profiles table
-- The issue is that users cannot read their own profile

-- First, let's see current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view pending member profiles" ON public.profiles;

-- Recreate policies with correct logic
-- Policy 1: Users can ALWAYS view their own profile (most important!)
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
