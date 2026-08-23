-- Supabase Auth trigger to automatically mirror auth.users to public.profiles
-- Run this in the Supabase SQL Editor once your project is active.

-- 1. Create the trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'User'),
    now()
  )
  on conflict (id) do update
  set display_name = coalesce(excluded.display_name, public.profiles.display_name);
  return new;
end;
$$;

-- 2. Create the trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
