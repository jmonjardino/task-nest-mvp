-- Allow admins to view profiles of users with pending membership requests for their company
CREATE POLICY "Admins can view pending member profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.company_members cm
    WHERE cm.user_id = profiles.id
    AND cm.company_id = get_user_company_id(auth.uid())
    AND cm.status = 'pending'
  )
);