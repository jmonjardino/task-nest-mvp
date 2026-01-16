-- Fix existing admin users that don't have a company assigned
-- This migration creates companies for admins that were created before the trigger fix

DO $$
DECLARE
  admin_record RECORD;
  new_company_id UUID;
BEGIN
  -- Loop through all admin users without a company
  FOR admin_record IN 
    SELECT DISTINCT p.id, p.full_name
    FROM profiles p
    INNER JOIN user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'admin'
    AND p.company_id IS NULL
  LOOP
    -- Create a company for this admin
    INSERT INTO companies (name)
    VALUES (admin_record.full_name || '''s Company')
    RETURNING id INTO new_company_id;
    
    -- Update the admin's profile with the new company_id
    UPDATE profiles
    SET company_id = new_company_id
    WHERE id = admin_record.id;
    
    RAISE NOTICE 'Created company % for admin %', new_company_id, admin_record.full_name;
  END LOOP;
END $$;
