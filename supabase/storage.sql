-- Supabase Storage Policies for 'card-images' bucket

-- 1. Allow ANYONE to insert/upload images to the 'card-images' bucket
-- Note: In production, you might want to restrict this to authenticated admins only.
CREATE POLICY "Allow public uploads to card-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'card-images' );

-- 2. Allow ANYONE to select/read images from the 'card-images' bucket
CREATE POLICY "Allow public viewing of card-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'card-images' );

-- 3. Allow ANYONE to update images (helpful for admin/cleanup)
CREATE POLICY "Allow public updates to card-images" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'card-images' );

-- 4. Allow ANYONE to delete images
CREATE POLICY "Allow public deletes to card-images" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'card-images' );
