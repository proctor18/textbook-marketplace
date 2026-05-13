create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  campus_id uuid references public.campuses(id) on delete set null,
  phone text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.textbook_listings
  add column user_id uuid references auth.users(id) on delete cascade;

create index textbook_listings_user_id_idx
  on public.textbook_listings (user_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Anyone can create an active listing" on public.textbook_listings;

create policy "Profiles are readable by everyone"
on public.profiles
for select
using (true);

create policy "Users can create their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Authenticated users can create owned active listings"
on public.textbook_listings
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'active'
  and length(trim(title)) between 2 and 160
  and price_cents >= 0
  and seller_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);

create policy "Listing owners can read their listings"
on public.textbook_listings
for select
to authenticated
using (auth.uid() = user_id);

create policy "Listing owners can update their listings"
on public.textbook_listings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.profiles to anon, authenticated;
grant update on public.textbook_listings to authenticated;
