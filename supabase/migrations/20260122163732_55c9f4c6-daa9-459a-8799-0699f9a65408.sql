-- Create home_content table for managing hero and KPIs
CREATE TABLE public.home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  value TEXT,
  label TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Home content is viewable by everyone" 
  ON public.home_content FOR SELECT USING (true);

-- Authenticated users can manage (admins)
CREATE POLICY "Authenticated users can insert home content" 
  ON public.home_content FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update home content" 
  ON public.home_content FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete home content" 
  ON public.home_content FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create storage bucket for home images
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-images', 'home-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for home images
CREATE POLICY "Home images are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'home-images');

CREATE POLICY "Authenticated users can upload home images" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'home-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update home images" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'home-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete home images" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'home-images' AND auth.role() = 'authenticated');

-- Insert initial content (current hardcoded values)
INSERT INTO public.home_content (section, title, subtitle, image_url, value, label, display_order) VALUES
  ('hero', 'Partners by nature', 'Ver el vídeo completo', '/hero-investment.jpg', NULL, NULL, 0),
  ('kpi_1', NULL, NULL, NULL, '€2.5bn', 'Activos bajo Gestión', 1),
  ('kpi_2', NULL, NULL, NULL, '>200', 'Inversiones desde 2008', 2),
  ('kpi_3', NULL, NULL, NULL, '35', 'Profesionales', 3);

-- Trigger to update updated_at
CREATE TRIGGER update_home_content_updated_at
  BEFORE UPDATE ON public.home_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();