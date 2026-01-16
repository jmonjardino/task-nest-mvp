-- Check if the trigger exists and what it does
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Check the function definition
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
