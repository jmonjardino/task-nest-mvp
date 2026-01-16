-- Debug script to check admin user state
-- Run this to see what's happening with the admin user

-- 1. Check all profiles and their company assignments
SELECT 
  p.id,
  p.full_name,
  p.company_id,
  c.name as company_name,
  ur.role
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN user_roles ur ON ur.user_id = p.id
ORDER BY p.created_at;

-- 2. Check if there are any admins without companies
SELECT 
  p.id,
  p.full_name,
  p.company_id,
  ur.role
FROM profiles p
INNER JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'admin'
AND p.company_id IS NULL;

-- 3. Check all companies
SELECT * FROM companies ORDER BY created_at;

-- 4. Check user_roles
SELECT 
  ur.user_id,
  ur.role,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
ORDER BY ur.role;
