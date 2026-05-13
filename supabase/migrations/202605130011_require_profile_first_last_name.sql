alter table public.profiles
  add column first_name text,
  add column last_name text;

update public.profiles
set
  first_name = coalesce(
    nullif(first_name, ''),
    nullif(split_part(trim(coalesce(display_name, '')), ' ', 1), ''),
    nullif(split_part(auth_user.email, '@', 1), ''),
    'Unknown'
  ),
  last_name = coalesce(
    nullif(last_name, ''),
    nullif(regexp_replace(trim(coalesce(display_name, '')), '^\S+\s*', ''), ''),
    'User'
  )
from auth.users as auth_user
where profiles.id = auth_user.id;

update public.profiles
set display_name = trim(first_name || ' ' || last_name);

alter table public.profiles
  alter column first_name set not null,
  alter column last_name set not null;

alter table public.profiles
  add constraint profiles_first_name_not_blank check (length(trim(first_name)) > 0),
  add constraint profiles_last_name_not_blank check (length(trim(last_name)) > 0);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first text := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  last text := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '');
begin
  insert into public.profiles (id, first_name, last_name, display_name)
  values (
    new.id,
    coalesce(first, split_part(new.email, '@', 1)),
    coalesce(last, 'User'),
    trim(coalesce(first, split_part(new.email, '@', 1)) || ' ' || coalesce(last, 'User'))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
