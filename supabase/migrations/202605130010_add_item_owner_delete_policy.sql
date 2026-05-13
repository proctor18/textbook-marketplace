create policy "Item owners can delete their items"
on public.marketplace_items
for delete
to authenticated
using (auth.uid() = user_id);

grant delete on public.marketplace_items to authenticated;
