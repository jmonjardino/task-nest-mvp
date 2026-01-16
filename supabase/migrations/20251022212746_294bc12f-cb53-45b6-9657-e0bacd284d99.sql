-- Block direct role insertion from client code
CREATE POLICY "Block direct role insertion"
ON public.user_roles FOR INSERT
WITH CHECK (false);

-- Update handle_new_user trigger to always assign 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'));
  
  -- Always assign 'user' role by default (never admin from signup)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;