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

create table if not exists generated_tasks (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references homes(id) on delete cascade,
  season text not null,
  task_id text not null,
  title text not null,
  url text,
  due_date date,
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

-- === Simple cross-device sync state ===
create table if not exists user_state (
  auth_uid uuid primary key,
  email text,
  profile jsonb not null default '{}'::jsonb,
  status jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default now()
);

alter table user_state enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'user_state_select') then
    create policy user_state_select on user_state for select
      using (auth.uid() = auth_uid);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'user_state_insert') then
    create policy user_state_insert on user_state for insert
      with check (auth.uid() = auth_uid);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'user_state_update') then
    create policy user_state_update on user_state for update
      using (auth.uid() = auth_uid);
  end if;
end $$;
