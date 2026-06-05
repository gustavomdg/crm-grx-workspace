-- CRM GRX Intelligence - Full Relational Schema
-- This schema defines the structure for the CRM entities.

-- 1. Users table (Equipe)
CREATE TABLE IF NOT EXISTS public.crm_usuarios (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text,
  email text,
  status text DEFAULT 'offline'
);

-- 2. Clients/Spaces table (Clientes)
CREATE TABLE IF NOT EXISTS public.crm_clientes (
  id text PRIMARY KEY,
  name text NOT NULL,
  tipo text,
  contact text,
  email text,
  phone text,
  stage text,
  value numeric DEFAULT 0,
  owner text,
  notes text,
  updated_at timestamptz DEFAULT now()
);

-- 3. Status configuration
CREATE TABLE IF NOT EXISTS public.crm_status (
  id text PRIMARY KEY,
  label text NOT NULL,
  className text NOT NULL
);

-- 4. Tasks table (Tarefas)
CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  client text,
  assignee text,
  status text REFERENCES public.crm_status(id),
  priority text,
  due_date text,
  description text,
  tag text,
  clickup_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Task Comments
CREATE TABLE IF NOT EXISTS public.crm_task_comments (
  id text PRIMARY KEY,
  task_id text REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  author text,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- -------------------------------------------------------------------------
-- PREVIEW MODE PERSISTENCE (Used currently by the frontend via JSONB sync)
-- -------------------------------------------------------------------------
create table if not exists public.crm_workspace_state (
  workspace_id text not null,
  state_key text not null,
  data jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, state_key)
);

alter table public.crm_workspace_state enable row level security;

drop policy if exists "crm workspace preview read" on public.crm_workspace_state;
drop policy if exists "crm workspace preview insert" on public.crm_workspace_state;
drop policy if exists "crm workspace preview update" on public.crm_workspace_state;
drop policy if exists "crm workspace preview delete" on public.crm_workspace_state;

create policy "crm workspace preview read"
  on public.crm_workspace_state
  for select
  to anon, authenticated
  using (true);

create policy "crm workspace preview insert"
  on public.crm_workspace_state
  for insert
  to anon, authenticated
  with check (true);

create policy "crm workspace preview update"
  on public.crm_workspace_state
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "crm workspace preview delete"
  on public.crm_workspace_state
  for delete
  to anon, authenticated
  using (true);

create index if not exists crm_workspace_state_updated_at_idx
  on public.crm_workspace_state (updated_at desc);
