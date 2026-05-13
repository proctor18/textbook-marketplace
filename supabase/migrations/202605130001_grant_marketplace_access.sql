grant usage on schema public to anon, authenticated;

grant usage on type public.listing_condition to anon, authenticated;
grant usage on type public.listing_status to anon, authenticated;

grant select on public.campuses to anon, authenticated;
grant select on public.textbook_listings to anon, authenticated;
grant insert on public.textbook_listings to anon, authenticated;
