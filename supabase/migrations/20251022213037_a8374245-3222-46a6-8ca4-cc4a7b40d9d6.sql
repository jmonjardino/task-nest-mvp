-- Update handle_new_user to make the first user an admin automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  new_company_id UUID;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'));
  
  -- Check if this is the first user in the system
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  IF user_count = 1 THEN
    -- First user becomes admin automatically
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Create a company for the first admin
    INSERT INTO public.companies (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador') || '''s Company')
    RETURNING id INTO new_company_id;
    
    -- Associate the admin with their company
    UPDATE public.profiles
    SET company_id = new_company_id
    WHERE id = NEW.id;
  ELSE
    -- All other users get 'user' role by default
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;