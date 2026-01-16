-- Fix pending members visibility issue
-- Ensure admins can view profiles of users with pending membership requests

-- Drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can view pending member profiles" ON public.profiles;

-- Recreate policy with improved logic
-- Note: Policies are PERMISSIVE by default (OR logic with other policies)
CREATE POLICY "Admins can view pending member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Check if current user is an admin
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
  AND
  -- Check if this profile has a pending membership request for admin's company
  EXISTS (
    SELECT 1 FROM public.company_members cm
    INNER JOIN public.profiles admin_profile ON admin_profile.id = auth.uid()
    WHERE cm.user_id = profiles.id
    AND cm.company_id = admin_profile.company_id
    AND cm.status = 'pending'
  )
);
