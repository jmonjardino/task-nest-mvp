-- Remove the overly permissive policy that allows enumeration
DROP POLICY IF EXISTS "Anyone can view invitations by code" ON public.company_invitations;

-- Create a secure function to validate invitation codes server-side
CREATE OR REPLACE FUNCTION public.validate_invitation_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id 
  FROM company_invitations 
  WHERE code = _code 
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

-- Allow admins to view their own company's invitations only
CREATE POLICY "Admins view company invitations"
ON public.company_invitations FOR SELECT
USING (is_company_admin(auth.uid(), company_id));