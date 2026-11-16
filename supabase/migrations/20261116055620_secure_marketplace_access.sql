-- Limit marketplace profiles to account owners and conversation partners.
drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles readable by owner and conversation partners"
on public.profiles for select to authenticated
using (
  id = (select auth.uid()) or exists (
    select 1 from public.conversations c
    where (c.buyer_id = (select auth.uid()) and c.seller_id = profiles.id)
       or (c.seller_id = (select auth.uid()) and c.buyer_id = profiles.id)
  )
);
revoke select, insert, update on public.profiles from anon;

-- Conversation ownership cannot be reassigned through the public API.
revoke update on public.conversations from authenticated;
drop policy if exists "Conversation participants can update conversations" on public.conversations;
drop policy if exists "Buyers can create conversations" on public.conversations;
create policy "Buyers can create conversations for active seller listings"
on public.conversations for insert to authenticated
with check (
  buyer_id = (select auth.uid()) and buyer_id <> seller_id
  and item_id is not null
  and exists (
    select 1 from public.marketplace_items mi
    where mi.id = item_id and mi.user_id = seller_id and mi.status = 'active'
  )
);

-- Messages should not be editable by marketplace participants.
revoke update on public.messages from authenticated;
drop policy if exists "Message recipients can mark messages read" on public.messages;

-- These are internal trigger helpers, not callable API methods.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_conversation_on_message() from public, anon, authenticated;
alter function public.set_updated_at() set search_path = '';
