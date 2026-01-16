# SOLUÇÃO FINAL - Fix RLS Profiles

## Problema Identificado

O console mostra: `Profile data: null Error: { object }`

Isso significa que as políticas RLS (Row Level Security) estão **bloqueando o usuário de ver o seu próprio perfil**, mesmo que o perfil exista no banco de dados.

## Solução

Execute este SQL no Supabase Studio:

### Passo 1: Abrir Supabase Studio

1. Vá para: https://supabase.com/dashboard/project/gzzexpfblicjwikdemke
2. Clique em "SQL Editor"
3. Clique em "New query"

### Passo 2: Executar Este SQL

```sql
-- Fix RLS policies blocking users from viewing their own profiles

-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view pending member profiles" ON public.profiles;

-- Policy 1: Users can ALWAYS view their own profile (CRITICAL!)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view profiles in their company  
CREATE POLICY "Admins can view profiles in their company"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
  AND company_id IS NOT NULL
  AND company_id = (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy 3: Admins can view pending member profiles
CREATE POLICY "Admins can view pending member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
  AND EXISTS (
    SELECT 1 FROM public.company_members cm
    INNER JOIN public.profiles admin_profile ON admin_profile.id = auth.uid()
    WHERE cm.user_id = profiles.id
    AND cm.company_id = admin_profile.company_id
    AND cm.status = 'pending'
  )
);

-- Verify policies were created
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
```

### Passo 3: Verificar

Você deve ver 3 políticas listadas:
- `Admins can view pending member profiles`
- `Admins can view profiles in their company`
- `Users can view their own profile`

### Passo 4: Testar

1. **Recarregue a página** do dashboard (F5)
2. O dashboard deve agora carregar normalmente
3. Você deve ver as estatísticas e botões de admin

## Se Ainda Não Funcionar

Execute esta query para verificar se o perfil está sendo retornado:

```sql
-- Test if you can read your own profile
SELECT 
  id,
  full_name,
  company_id,
  created_at
FROM profiles
WHERE id = auth.uid();
```

Se retornar 1 linha com seus dados, a política está funcionando.
Se retornar 0 linhas, há ainda um problema com RLS.
