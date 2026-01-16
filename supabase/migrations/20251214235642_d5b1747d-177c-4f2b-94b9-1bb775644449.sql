-- Drop existing restrictive SELECT policies on tasks
DROP POLICY IF EXISTS "Admins can view all tasks in their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON public.tasks;

-- Create permissive SELECT policies (using default PERMISSIVE - at least one must pass)
CREATE POLICY "Admins can view all tasks in their company"
ON public.tasks
FOR SELECT
USING (is_company_admin(auth.uid(), company_id));

CREATE POLICY "Users can view their assigned tasks"
ON public.tasks
FOR SELECT
USING (auth.uid() = assignee_id);