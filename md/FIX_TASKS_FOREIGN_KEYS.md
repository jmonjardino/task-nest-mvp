# Fix: Adicionar Foreign Keys Faltando em Tasks

## Problema

O erro mostra:
```
"Could not find a relationship between 'tasks' and 'assignee_id' in the schema cache"
```

Quando você apagou os dados do banco, várias foreign keys foram perdidas.

## Solução

Execute este SQL no Supabase Studio:

```sql
-- Adicionar foreign key entre tasks.assignee_id e profiles.id
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_assignee_id_fkey
FOREIGN KEY (assignee_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Adicionar foreign key entre tasks.created_by e profiles.id (se não existir)
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Adicionar foreign key entre tasks.company_id e companies.id (se não existir)
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_company_id_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_company_id_fkey
FOREIGN KEY (company_id)
REFERENCES public.companies(id)
ON DELETE CASCADE;

-- Adicionar foreign key entre tasks.team_id e teams.id (se não existir)
ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_team_id_fkey;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_team_id_fkey
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE SET NULL;

-- Recarregar schema cache
NOTIFY pgrst, 'reload schema';

-- Verificar que foram criadas
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
    AND tc.table_name = 'tasks'
ORDER BY kcu.column_name;
```

## Resultado Esperado

A query de verificação deve retornar 4 linhas mostrando as foreign keys:
- `tasks_assignee_id_fkey`: assignee_id → profiles.id
- `tasks_company_id_fkey`: company_id → companies.id
- `tasks_created_by_fkey`: created_by → profiles.id
- `tasks_team_id_fkey`: team_id → teams.id

## Teste

Depois de executar:
1. Aguarde 5 segundos
2. Recarregue a página (F5)
3. As tarefas devem agora aparecer no dashboard

## Próximo Passo

Depois de resolver isso, vamos precisar corrigir outras foreign keys que podem estar faltando em outras tabelas (teams, team_members, etc.).
