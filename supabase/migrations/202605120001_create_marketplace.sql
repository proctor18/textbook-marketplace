create extension if not exists pgcrypto;

create type public.listing_condition as enum (
  'new',
  'like_new',
  'good',
  'fair',
  'worn'
);

create type public.listing_status as enum (
  'active',
  'pending',
  'sold',
  'archived'
);

create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  city text,
  region text,
  created_at timestamptz not null default now()
);

create table public.textbook_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  isbn text,
  course_code text,
  campus_id uuid references public.campuses(id) on delete set null,
  price_cents integer not null check (price_cents >= 0),
  condition public.listing_condition not null default 'good',
  description text,
  seller_name text not null,
  seller_email text not null,
  status public.listing_status not null default 'active',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index textbook_listings_active_idx
  on public.textbook_listings (status, created_at desc);

create index textbook_listings_course_code_idx
  on public.textbook_listings (upper(course_code));

create index textbook_listings_isbn_idx
  on public.textbook_listings (isbn);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger textbook_listings_set_updated_at
before update on public.textbook_listings
for each row
execute function public.set_updated_at();

insert into public.campuses (name, city, region)
values
  ('Main Campus', 'Calgary', 'AB'),
  ('Downtown Campus', 'Calgary', 'AB'),
  ('Online', null, null);

alter table public.campuses enable row level security;
alter table public.textbook_listings enable row level security;

create policy "Campuses are readable by everyone"
on public.campuses
for select
using (true);

create policy "Active listings are readable by everyone"
on public.textbook_listings
for select
using (status = 'active');

create policy "Anyone can create an active listing"
on public.textbook_listings
for insert
with check (
  status = 'active'
  and length(trim(title)) between 2 and 160
  and price_cents >= 0
  and seller_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
);
