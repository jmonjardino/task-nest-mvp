-- Test the handle_new_user function directly
-- This simulates what happens when a user signs up

DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_metadata JSONB;
BEGIN
  -- Simulate admin signup metadata
  test_metadata := jsonb_build_object(
    'full_name', 'Test Admin',
    'user_type', 'admin'
  );
  
  -- Manually call what the trigger should do
  RAISE NOTICE 'Testing with user_id: %', test_user_id;
  RAISE NOTICE 'Metadata: %', test_metadata;
  
  -- Create profile
  INSERT INTO profiles (id, full_name)
  VALUES (test_user_id, COALESCE(test_metadata->>'full_name', 'Utilizador'));
  
  -- Check if user_type is admin
  IF test_metadata->>'user_type' = 'admin' THEN
    DECLARE
      new_company_id UUID;
    BEGIN
      -- Create company
      INSERT INTO companies (name)
      VALUES ((test_metadata->>'full_name') || '''s Company')
      RETURNING id INTO new_company_id;
      
      RAISE NOTICE 'Created company: %', new_company_id;
      
      -- Update profile
      UPDATE profiles
      SET company_id = new_company_id
      WHERE id = test_user_id;
      
      -- Create role
      INSERT INTO user_roles (user_id, role)
      VALUES (test_user_id, 'admin');
      
      RAISE NOTICE 'SUCCESS: Admin setup complete!';
    END;
  END IF;
  
  -- Verify
  SELECT 
    p.id,
    p.full_name,
    p.company_id,
    c.name as company_name,
    ur.role
  FROM profiles p
  LEFT JOIN companies c ON p.company_id = c.id
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id = test_user_id;
  
  -- Cleanup test data
  DELETE FROM user_roles WHERE user_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
  DELETE FROM companies WHERE id IN (
    SELECT company_id FROM profiles WHERE id = test_user_id
  );
  
  RAISE NOTICE 'Test complete and cleaned up';
END $$;
