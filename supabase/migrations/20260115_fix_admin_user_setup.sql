-- Fix admin user setup by updating the handle_new_user trigger
-- This ensures admin users get their company and role created automatically

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop and recreate the function with admin setup logic
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
  user_type TEXT;
BEGIN
  -- Get user type from metadata (set during signup)
  user_type := NEW.raw_user_meta_data->>'user_type';
  
  -- Create profile first (required for all users)
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'));
  
  -- If admin, create company and assign role
  IF user_type = 'admin' THEN
    -- Create a new company for this admin
    INSERT INTO public.companies (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador') || '''s Company')
    RETURNING id INTO new_company_id;
    
    -- Update the profile with the company_id
    UPDATE public.profiles
    SET company_id = new_company_id
    WHERE id = NEW.id;
    
    -- Create admin role entry
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
