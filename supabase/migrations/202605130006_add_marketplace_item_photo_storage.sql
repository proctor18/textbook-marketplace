insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-item-photos',
  'marketplace-item-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Marketplace item photos are publicly readable"
on storage.objects
for select
using (bucket_id = 'marketplace-item-photos');

create policy "Users can upload their marketplace item photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'marketplace-item-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their marketplace item photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'marketplace-item-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'marketplace-item-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their marketplace item photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'marketplace-item-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
