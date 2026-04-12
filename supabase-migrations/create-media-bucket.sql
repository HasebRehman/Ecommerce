-- Create media storage bucket for reports
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Allow anyone to read public media
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'media');

-- Allow authenticated users to upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

-- Allow users to delete their own uploads
create policy "Users can delete own uploads"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);