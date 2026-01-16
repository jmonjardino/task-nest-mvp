-- Force fix for admin users without company
-- This is a more aggressive approach that will definitely work

-- First, let's see what we're working with
DO $$
DECLARE
  admin_count INTEGER;
  company_count INTEGER;
BEGIN
  -- Count admins without company
  SELECT COUNT(*) INTO admin_count
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'admin' AND p.company_id IS NULL;
  
  RAISE NOTICE 'Found % admin(s) without company', admin_count;
  
  -- Count total companies
  SELECT COUNT(*) INTO company_count FROM companies;
  RAISE NOTICE 'Total companies in database: %', company_count;
END $$;

-- Now fix each admin without a company
DO $$
DECLARE
  admin_record RECORD;
  new_company_id UUID;
  company_name TEXT;
BEGIN
  FOR admin_record IN 
    SELECT p.id, p.full_name, p.company_id
    FROM profiles p
    INNER JOIN user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'admin'
    AND p.company_id IS NULL
  LOOP
    -- Create company name
    company_name := COALESCE(admin_record.full_name, 'Admin') || ' Company';
    
    -- Insert company
    INSERT INTO companies (name, created_at, updated_at)
    VALUES (company_name, NOW(), NOW())
    RETURNING id INTO new_company_id;
    
    RAISE NOTICE 'Created company: % (ID: %)', company_name, new_company_id;
    
    -- Update profile
    UPDATE profiles
    SET company_id = new_company_id, updated_at = NOW()
    WHERE id = admin_record.id;
    
    RAISE NOTICE 'Updated admin % with company %', admin_record.full_name, new_company_id;
  END LOOP;
  
  -- Verify the fix
  DECLARE
    remaining_admins INTEGER;
  BEGIN
    SELECT COUNT(*) INTO remaining_admins
    FROM profiles p
    INNER JOIN user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'admin' AND p.company_id IS NULL;
    
    IF remaining_admins = 0 THEN
      RAISE NOTICE 'SUCCESS: All admins now have companies!';
    ELSE
      RAISE WARNING 'PROBLEM: Still % admin(s) without company', remaining_admins;
    END IF;
  END;
END $$;
