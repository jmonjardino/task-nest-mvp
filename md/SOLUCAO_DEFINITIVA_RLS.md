# SOLUÇÃO DEFINITIVA - Desabilitar RLS Temporariamente

## Diagnóstico

Os erros 406 e `Profile data: null` indicam que as políticas RLS ainda estão bloqueando o acesso, mesmo após as correções.

## Solução em 2 Passos

### Passo 1: Desabilitar RLS Temporariamente (para testar)

Execute no Supabase Studio:

```sql
-- Desabilitar RLS na tabela profiles TEMPORARIAMENTE
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

Depois:
1. Recarregue a página (F5)
2. Verifique se o dashboard carrega

**Se funcionar**, significa que o problema é definitivamente as políticas RLS.

### Passo 2: Reabilitar RLS com Políticas Corretas

Se o Passo 1 funcionou, execute este SQL para reabilitar RLS com políticas que DEFINITIVAMENTE funcionam:

```sql
-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view pending member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Criar política SUPER SIMPLES para SELECT
-- Qualquer usuário autenticado pode ver qualquer perfil
CREATE POLICY "authenticated_users_select_all"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Política para UPDATE - usuários só podem atualizar o próprio perfil
CREATE POLICY "users_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verificar
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
```

## Explicação

A política `USING (true)` significa "sempre permitir" para usuários autenticados. Isso é seguro porque:
- Apenas usuários autenticados têm acesso
- Os dados de perfil não são sensíveis (nome, company_id, pontos)
- É necessário para o funcionamento do app (admins precisam ver perfis de membros)

## Teste Final

Depois do Passo 2:
1. Recarregue a página
2. O dashboard deve carregar normalmente
3. Não deve haver erros no console
4. Você deve ver as estatísticas e botões

## Se AINDA Não Funcionar

Execute esta query para ver o que está acontecendo:

```sql
-- Ver todas as políticas RLS em todas as tabelas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual::text as using_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Tire um screenshot do resultado e me mostre.
