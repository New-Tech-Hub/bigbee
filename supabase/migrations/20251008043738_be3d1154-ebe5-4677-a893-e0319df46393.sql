-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- RLS Policies for category-images bucket
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Super admin can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' 
  AND public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admin can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' 
  AND public.is_super_admin(auth.uid())
);

CREATE POLICY "Super admin can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' 
  AND public.is_super_admin(auth.uid())
);