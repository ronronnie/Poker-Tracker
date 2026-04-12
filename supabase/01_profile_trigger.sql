-- ============================================================
-- OUTS — Supabase Setup SQL
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the profiles table (mirrors auth.users)
-- Note: Drizzle handles schema via db:push, but if running manually use this.

-- 2. Trigger: auto-create a profile row on every new sign-up
--    This fires when Supabase Auth creates a new user.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    currency,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'INR',
    'free',
    'active',
    now(),
    now()
  );
  return new;
end;
$$;

-- Drop existing trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- RLS (Row Level Security) Policies
-- Users can only read/write their own data.
-- ============================================================

-- profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- sessions
alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- groups
alter table public.groups enable row level security;

create policy "Group members can view groups"
  on public.groups for select
  using (
    auth.uid() = created_by or
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

create policy "Group admin can update group"
  on public.groups for update
  using (auth.uid() = created_by);

-- group_members
alter table public.group_members enable row level security;

create policy "Group members can view members"
  on public.group_members for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.group_members for insert
  with check (auth.uid() = user_id);

-- hand_histories
alter table public.hand_histories enable row level security;

create policy "Users can view own hand histories"
  on public.hand_histories for select
  using (auth.uid() = user_id);

create policy "Users can insert own hand histories"
  on public.hand_histories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own hand histories"
  on public.hand_histories for update
  using (auth.uid() = user_id);

create policy "Users can delete own hand histories"
  on public.hand_histories for delete
  using (auth.uid() = user_id);
