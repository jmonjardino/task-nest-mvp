# Solução Final: Executar SQL Diretamente no Supabase Studio

O trigger não está funcionando corretamente. Vamos aplicar a correção diretamente no Supabase Studio.

## Passo 1: Abrir Supabase Studio

1. Vá para: https://supabase.com/dashboard/project/gzzexpfblicjwikdemke
2. Clique em "SQL Editor" no menu lateral esquerdo
3. Clique em "New query"

## Passo 2: Executar Este SQL

Cole e execute este SQL completo:

```sql
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected function
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
  -- Get user type from metadata
  user_type := NEW.raw_user_meta_data->>'user_type';
  
  RAISE NOTICE 'New user signup - ID: %, Type: %', NEW.id, user_type;
  
  -- Create profile first
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'));
  
  RAISE NOTICE 'Profile created for user: %', NEW.id;
  
  -- If admin, create company and assign role
  IF user_type = 'admin' THEN
    RAISE NOTICE 'Creating company for admin user: %', NEW.id;
    
    -- Create a new company
    INSERT INTO public.companies (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador') || '''s Company')
    RETURNING id INTO new_company_id;
    
    RAISE NOTICE 'Company created with ID: %', new_company_id;
    
    -- Update profile with company_id
    UPDATE public.profiles
    SET company_id = new_company_id
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Profile updated with company_id: %', new_company_id;
    
    -- Create admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    RAISE NOTICE 'Admin role created for user: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify it was created
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
```

## Passo 3: Verificar o Resultado

Você deve ver uma tabela mostrando:
- trigger_name: `on_auth_user_created`
- enabled: `O` (significa enabled)
- function_name: `handle_new_user`

## Passo 4: Testar

1. Faça logout
2. Crie uma nova conta admin com email diferente (ex: `finaltest@test.com`)
3. Após registo, o dashboard deve carregar normalmente

## Se Ainda Não Funcionar

Execute este SQL para verificar os logs:

```sql
-- Check if there are any users without company_id
SELECT 
  p.id,
  p.full_name,
  p.company_id,
  ur.role,
  p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
ORDER BY p.created_at DESC
LIMIT 10;
```

Tire um screenshot do resultado e me mostre.
