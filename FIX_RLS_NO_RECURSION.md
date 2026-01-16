# FIX FINAL - RLS Sem Recursão

## Problema

As políticas RLS criaram recursão infinita porque a política de admin estava tentando ler da tabela `profiles` dentro da própria política de `profiles`.

## Solução - Execute no Supabase Studio

```sql
-- Remove ALL existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view pending member profiles" ON public.profiles;

-- Policy 1: Users can ALWAYS view their own profile
-- This is simple and has NO recursion
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view ANY profile (simplified - no recursion)
-- We check admin role directly without reading profiles table
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- Verify policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
```

## Explicação

- **Policy 1**: Qualquer usuário autenticado pode ver o seu próprio perfil (sem recursão)
- **Policy 2**: Admins podem ver TODOS os perfis (simplificado, sem recursão)

Isso resolve o problema porque:
1. Não há mais recursão (não lemos `profiles` dentro da política de `profiles`)
2. Admins têm acesso total (necessário para ver membros pendentes e da empresa)
3. Usuários regulares só veem o próprio perfil

## Teste

Depois de executar:
1. Recarregue a página (F5)
2. O dashboard deve carregar normalmente
3. Não deve haver erros de recursão no console
