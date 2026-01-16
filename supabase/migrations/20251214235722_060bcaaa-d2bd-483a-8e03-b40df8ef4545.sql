-- Drop existing restrictive UPDATE policies on tasks
DROP POLICY IF EXISTS "Admins can update tasks in their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their assigned tasks status" ON public.tasks;

-- Create permissive UPDATE policies
CREATE POLICY "Admins can update tasks in their company"
ON public.tasks
FOR UPDATE
USING (is_company_admin(auth.uid(), company_id));

CREATE POLICY "Users can update their assigned tasks status"
ON public.tasks
FOR UPDATE
USING (auth.uid() = assignee_id);