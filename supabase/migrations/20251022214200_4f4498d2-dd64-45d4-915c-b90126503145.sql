-- Update handle_new_user to handle admin registration with company creation
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
  
  -- If admin, create company automatically
  IF user_role = 'admin' THEN
    INSERT INTO public.companies (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador') || '''s Company')
    RETURNING id INTO new_company_id;
    
    -- Associate the admin with their company
    UPDATE public.profiles
    SET company_id = new_company_id
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;