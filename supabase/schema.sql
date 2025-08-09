-- Minimal schema for server persistence (later)

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid not null,
  email text not null,
  created_at timestamp with time zone default now()
);

create table if not exists homes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  zip text not null,
  features text[] not null default '{}',
  created_at timestamp with time zone default now()
);

create table if not exists task_templates (
  id text primary key,
  season text not null check (season in ('Spring','Summer','Fall','Winter')),
  regions text[] not null default '{}',
  features text[] not null default '{}',
  est_time text not null,
  instructions_url text not null,
  title text not null
);

create table if not exists generated_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  home_id uuid references homes(id) on delete cascade,
  template_id text references task_templates(id),
  custom_title text,
  scheduled_date timestamp with time zone,
  status text not null default 'pending' check (status in ('pending','completed','skipped','snoozed')),
  created_at timestamp with time zone default now()
);

create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references generated_tasks(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  notes text
);

-- RLS example stubs (adjust later)
alter table users enable row level security;
alter table homes enable row level security;
alter table generated_tasks enable row level security;
alter table completions enable row level security;

-- Policy examples (replace with auth.uid() mapping once you store user rows)
-- create policy "users self" on users for select using (true);
