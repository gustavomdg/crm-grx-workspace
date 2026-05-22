# CRM GRX Intelligence

CRM operacional separado do projeto ERP Notas.

## Rodar localmente

```bash
npm install
npm run dev -- --port 3001
```

Preview:

```text
http://localhost:3001
```

## Funcionalidades atuais

- Tarefas: criar, editar, duplicar, comentar, mover status e excluir.
- Clientes: criar, editar, mover etapa comercial e excluir.
- Docs: criar, importar placeholder, editar, favoritar e excluir.
- Chat: enviar mensagens e navegar para perfil/time.
- Time: convidar, editar e remover membros.
- Dashboard: metricas dinamicas, refresh, edit mode e cards customizados.
- Formularios: criar, editar, excluir, templates e respostas teste.

## Persistencia

O app sempre salva no navegador com `localStorage`. Se `.env.local` tiver:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

ele tambem tenta sincronizar com Supabase na tabela `crm_workspace_state`.

Para habilitar a sincronizacao remota, rode no SQL Editor do Supabase:

```text
supabase/schema.sql
```

O indicador no canto inferior mostra:

- `Local`: sem Supabase configurado.
- `Conectando`: buscando/salvando estado remoto.
- `Supabase`: sincronizacao ativa.
- `Fallback local`: Supabase configurado, mas tabela/politica/rede falhou.

## Proximos passos tecnicos

1. Substituir a tabela JSONB de preview por schema relacional completo.
2. Adicionar Supabase Auth e politicas RLS por usuario/workspace.
3. Separar `src/app/page.tsx` em componentes e hooks menores.
4. Criar testes E2E dos fluxos principais de CRUD.
5. Conectar AI/Automate a OpenAI/N8N ou rotas internas.
