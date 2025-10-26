-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admins can manage logos (insert, update, delete)
CREATE POLICY "Admins can manage company logos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'company-logos' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM public.admin_users 
    WHERE is_active = true
  )
)
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM public.admin_users 
    WHERE is_active = true
  )
);

-- Policy: Anyone can view company logos
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');