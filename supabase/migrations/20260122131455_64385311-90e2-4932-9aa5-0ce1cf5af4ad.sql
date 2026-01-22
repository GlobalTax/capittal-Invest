-- Create video_slides table
CREATE TABLE public.video_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_slides ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Video slides are viewable by everyone" 
  ON public.video_slides FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Authenticated users can insert video slides" 
  ON public.video_slides FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update video slides" 
  ON public.video_slides FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete video slides" 
  ON public.video_slides FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create storage bucket for video slide images
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-slides', 'video-slides', true);

-- Storage policies
CREATE POLICY "Video slide images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'video-slides');

CREATE POLICY "Authenticated users can upload video slide images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'video-slides' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update video slide images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'video-slides' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete video slide images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'video-slides' AND auth.role() = 'authenticated');

-- Insert initial slides (using placeholder URLs - will be updated via admin)
INSERT INTO public.video_slides (title, subtitle, image_url, display_order, is_active) VALUES
  ('Décadas construyendo un legado...', NULL, '/assets/slideshow/slide-01-legacy.jpg', 1, true),
  ('Llega el momento de decidir su futuro', NULL, '/assets/slideshow/slide-02-transition.jpg', 2, true),
  ('Una nueva historia comienza', NULL, '/assets/slideshow/slide-03-newbeginning.jpg', 3, true),
  ('Con el socio adecuado a tu lado', NULL, '/assets/slideshow/slide-04-partnership.jpg', 4, true),
  ('Ethos Capital', 'Inversión con propósito', '/assets/slideshow/slide-05-future.jpg', 5, true);

-- Create updated_at trigger
CREATE TRIGGER update_video_slides_updated_at
  BEFORE UPDATE ON public.video_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();