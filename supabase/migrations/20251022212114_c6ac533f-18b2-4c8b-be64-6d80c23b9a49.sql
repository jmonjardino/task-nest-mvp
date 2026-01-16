-- Fix 1: Add database constraints for task input validation
ALTER TABLE tasks 
ADD CONSTRAINT task_title_length CHECK (char_length(title) > 0 AND char_length(title) <= 200);

ALTER TABLE tasks
ADD CONSTRAINT task_description_length CHECK (description IS NULL OR char_length(description) <= 2000);

ALTER TABLE tasks
ADD CONSTRAINT task_points_range CHECK (points >= 0 AND points <= 1000);

-- Fix 3: Add policies to allow admins to revoke/update invitation codes
CREATE POLICY "Admins can delete company invitations"
ON company_invitations FOR DELETE
USING (is_company_admin(auth.uid(), company_id));

CREATE POLICY "Admins can update company invitations"
ON company_invitations FOR UPDATE
USING (is_company_admin(auth.uid(), company_id))
WITH CHECK (is_company_admin(auth.uid(), company_id));