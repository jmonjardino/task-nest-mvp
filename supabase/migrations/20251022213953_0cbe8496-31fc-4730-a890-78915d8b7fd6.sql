-- Update handle_new_user to accept role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  new_company_id UUID;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'));
  
  -- Get user type from metadata, default to 'user'
  user_role := COALESCE(NEW.raw_user_meta_data->>'user_type', 'user')::app_role;
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$;