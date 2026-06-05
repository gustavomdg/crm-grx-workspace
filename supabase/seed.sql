-- Seed data for CRM

-- Users
INSERT INTO public.users (id, name, initials, color) VALUES (uuid_generate_v4(), 'Gustavo Roque', 'GR', '#333');
INSERT INTO public.users (id, name, initials, color) VALUES (uuid_generate_v4(), 'Danielle', 'D', '#333');
INSERT INTO public.users (id, name, initials, color) VALUES (uuid_generate_v4(), 'Leonardo Avallone', 'LA', '#333');

-- Note: In the current setup, data is stored in crm_workspace_state as jsonb.
-- When moving to a fully relational schema, use these inserts.
