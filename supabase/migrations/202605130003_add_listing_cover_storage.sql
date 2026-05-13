insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'textbook-covers',
  'textbook-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Textbook covers are publicly readable"
on storage.objects
for select
using (bucket_id = 'textbook-covers');

create policy "Users can upload their textbook covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'textbook-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their textbook covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'textbook-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'textbook-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their textbook covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'textbook-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);
