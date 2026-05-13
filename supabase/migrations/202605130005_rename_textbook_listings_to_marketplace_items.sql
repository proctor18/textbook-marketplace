alter table public.textbook_listings rename to marketplace_items;

alter index if exists textbook_listings_active_idx rename to marketplace_items_active_idx;
alter index if exists textbook_listings_course_code_idx rename to marketplace_items_course_code_idx;
alter index if exists textbook_listings_isbn_idx rename to marketplace_items_isbn_idx;
alter index if exists textbook_listings_user_id_idx rename to marketplace_items_user_id_idx;

alter trigger textbook_listings_set_updated_at on public.marketplace_items
rename to marketplace_items_set_updated_at;

alter table public.marketplace_items
  rename constraint textbook_listings_campus_id_fkey to marketplace_items_campus_id_fkey;

alter table public.marketplace_items
  rename constraint textbook_listings_user_id_fkey to marketplace_items_user_id_fkey;

alter policy "Active listings are readable by everyone"
on public.marketplace_items
rename to "Active items are readable by everyone";

alter policy "Authenticated users can create owned active listings"
on public.marketplace_items
rename to "Authenticated users can create owned active items";

alter policy "Listing owners can read their listings"
on public.marketplace_items
rename to "Item owners can read their items";

alter policy "Listing owners can update their listings"
on public.marketplace_items
rename to "Item owners can update their items";
