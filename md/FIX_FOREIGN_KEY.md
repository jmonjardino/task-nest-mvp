# Fix: Adicionar Foreign Key Entre company_members e profiles

## Problema

O erro mostra:
```
"Could not find a relationship between 'company_members' and 'profiles' in the schema cache"
```

Isso significa que a **foreign key** entre `company_members.user_id` e `profiles.id` não existe no banco de dados.

## Solução

Execute este SQL no Supabase Studio:

```sql
-- Adicionar foreign key entre company_members.user_id e profiles.id
ALTER TABLE public.company_members
ADD CONSTRAINT company_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Verificar que foi adicionada
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'company_members'
    AND kcu.column_name = 'user_id';
```

## Resultado Esperado

A query de verificação deve retornar 1 linha mostrando:
- `constraint_name`: `company_members_user_id_fkey`
- `column_name`: `user_id`
- `foreign_table_name`: `profiles`
- `foreign_column_name`: `id`

## Teste

Depois de executar:
1. Recarregue a página do dashboard (F5)
2. Clique no botão "Pedidos Pendentes"
3. Os membros pendentes devem agora aparecer na lista

## Se Der Erro

Se o SQL retornar um erro dizendo que a constraint já existe, execute:

```sql
-- Remover constraint antiga (se existir)
ALTER TABLE public.company_members
DROP CONSTRAINT IF EXISTS company_members_user_id_fkey;

-- Adicionar novamente
ALTER TABLE public.company_members
ADD CONSTRAINT company_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
```
