# Debug: Verificar Por Que Profile Não É Atualizado

## Problema

Quando o admin aprova um membro, o `company_id` deveria ser atualizado no perfil, mas não está acontecendo.

## Passo 1: Verificar Políticas RLS de UPDATE em Profiles

Execute no Supabase Studio:

```sql
-- Ver políticas de UPDATE na tabela profiles
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND schemaname = 'public'
  AND cmd = 'UPDATE'
ORDER BY policyname;
```

**Problema esperado**: Provavelmente só existe a política "users_update_own_profile" que permite que usuários atualizem apenas o próprio perfil. Isso significa que o **admin não consegue atualizar o perfil de outro usuário**.

## Passo 2: Adicionar Política para Admins Atualizarem Perfis

Se o Passo 1 confirmar o problema, execute:

```sql
-- Adicionar política para admins poderem atualizar perfis da empresa
CREATE POLICY "admins_can_update_company_profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- Verificar que foi criada
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'UPDATE'
ORDER BY policyname;
```

## Passo 3: Testar Aprovação Novamente

1. Crie um novo usuário regular com código de convite
2. Como admin, aprove o usuário
3. Faça logout e login como o usuário regular
4. O dashboard deve agora carregar normalmente

## Alternativa: Verificar Manualmente no Banco

Para confirmar que o problema é RLS, execute:

```sql
-- Ver todos os perfis e seus company_ids
SELECT 
  id,
  full_name,
  company_id,
  created_at
FROM profiles
ORDER BY created_at DESC;
```

Se você ver usuários com `company_id = NULL` que deveriam ter sido aprovados, confirma que a atualização não está funcionando.
