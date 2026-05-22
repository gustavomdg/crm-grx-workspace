-- CRM GRX Intelligence - preview persistence schema
-- Run this in Supabase SQL Editor before using remote sync.
--
-- This preview table stores the CRM workspace slices as JSONB so the app can
-- persist CRUD state immediately while the final relational CRM schema is being
-- designed. Lock these policies down before production multi-user rollout.

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
