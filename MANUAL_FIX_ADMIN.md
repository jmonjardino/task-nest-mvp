# Manual Fix for Admin Without Company

Since the migrations are having issues, here's a manual SQL script you can run directly in Supabase Studio:

## Steps to Fix

1. **Open Supabase Studio**:
   - Go to https://supabase.com/dashboard
   - Select your project: `gzzexpfblicjwikdemke`
   - Click on "SQL Editor" in the left sidebar

2. **Run this SQL**:

```sql
-- Step 1: Check current state
SELECT 
  p.id,
  p.full_name,
  p.company_id,
  ur.role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'admin';

-- Step 2: Create company for admin without one
DO $$
DECLARE
  admin_id UUID;
  admin_name TEXT;
  new_company_id UUID;
BEGIN
  -- Find admin without company
  SELECT p.id, p.full_name INTO admin_id, admin_name
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'admin'
  AND p.company_id IS NULL
  LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    -- Create company
    INSERT INTO companies (name)
    VALUES (COALESCE(admin_name, 'Admin') || ' Company')
    RETURNING id INTO new_company_id;
    
    -- Update profile
    UPDATE profiles
    SET company_id = new_company_id
    WHERE id = admin_id;
    
    RAISE NOTICE 'Created company % for admin %', new_company_id, admin_name;
  ELSE
    RAISE NOTICE 'No admin without company found';
  END IF;
END $$;

-- Step 3: Verify the fix
SELECT 
  p.id,
  p.full_name,
  p.company_id,
  c.name as company_name,
  ur.role
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'admin';
```

3. **After running the SQL**:
   - Logout from your admin account
   - Login again
   - Dashboard should now load properly

## Alternative: Create New Admin

If the above doesn't work, the easiest solution is to create a fresh admin account:

1. Logout from current account
2. Go to registration page
3. Select "Administrador (cria nova empresa)"
4. Register with a new email
5. The new trigger will automatically create the company

The new admin will work perfectly because the trigger fix is now in place.
