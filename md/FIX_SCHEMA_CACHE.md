# Fix: Recarregar Schema Cache do PostgREST

## Problema

A foreign key existe, mas o Supabase PostgREST não está reconhecendo a relação devido ao cache desatualizado.

## Solução 1: Recarregar Schema Cache

Execute este SQL no Supabase Studio:

```sql
-- Força o PostgREST a recarregar o schema cache
NOTIFY pgrst, 'reload schema';
```

Depois:
1. Aguarde 5-10 segundos
2. Recarregue a página do dashboard (F5)
3. Teste se os membros pendentes aparecem

## Solução 2: Verificar a Foreign Key

Se a Solução 1 não funcionar, vamos verificar se a foreign key está correta:

```sql
-- Ver todas as foreign keys da tabela company_members
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
    AND tc.table_name = 'company_members';
```

**Resultado esperado**: Deve mostrar uma linha com:
- `column_name`: `user_id`
- `foreign_table_name`: `profiles`
- `foreign_column_name`: `id`

## Solução 3: Recriar a Foreign Key

Se a foreign key não estiver apontando corretamente, recrie:

```sql
-- Remover e recriar
ALTER TABLE public.company_members
DROP CONSTRAINT IF EXISTS company_members_user_id_fkey;

ALTER TABLE public.company_members
ADD CONSTRAINT company_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Recarregar cache
NOTIFY pgrst, 'reload schema';
```

## Solução 4: Alternativa - Mudar a Query

Se nada funcionar, podemos mudar a query no código para não usar JOIN. Em vez de:

```typescript
.select(`*, profiles (full_name)`)
```

Usar duas queries separadas (menos eficiente, mas funciona):

```typescript
// Buscar membros pendentes
const { data: pendingData } = await supabase
  .from("company_members")
  .select("*")
  .eq("company_id", compId)
  .eq("status", "pending");

// Buscar perfis para cada membro
if (pendingData) {
  const membersWithProfiles = await Promise.all(
    pendingData.map(async (member) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", member.user_id)
        .single();
      
      return {
        ...member,
        profiles: profile || { full_name: "Unknown" }
      };
    })
  );
  setPendingMembers(membersWithProfiles);
}
```

Me diga qual solução você quer tentar primeiro!
