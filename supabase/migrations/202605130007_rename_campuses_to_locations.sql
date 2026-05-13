alter table public.campuses rename to locations;

alter table public.locations rename constraint campuses_pkey to locations_pkey;
alter table public.locations rename constraint campuses_name_key to locations_name_key;

alter table public.marketplace_items rename column campus_id to location_id;
alter table public.profiles rename column campus_id to location_id;

alter table public.marketplace_items
  rename constraint marketplace_items_campus_id_fkey to marketplace_items_location_id_fkey;

alter table public.profiles
  rename constraint profiles_campus_id_fkey to profiles_location_id_fkey;

alter policy "Campuses are readable by everyone"
on public.locations
rename to "Locations are readable by everyone";

grant select on public.locations to anon, authenticated;
