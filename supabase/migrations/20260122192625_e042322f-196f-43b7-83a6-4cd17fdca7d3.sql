-- Create about_content table for managing About page sections
CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL, -- 'hero', 'kpi', 'strategy', 'value_creation', 'awards', 'esg'
  title TEXT,
  subtitle TEXT,
  content TEXT,
  value TEXT,           -- For numeric KPIs
  label TEXT,           -- KPI label
  image_url TEXT,
  icon TEXT,            -- Lucide icon name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Public read access for the frontend
CREATE POLICY "About content is publicly readable"
ON public.about_content
FOR SELECT
USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage about content"
ON public.about_content
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_about_content_updated_at
BEFORE UPDATE ON public.about_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial content
INSERT INTO public.about_content (section, title, subtitle, content, value, label, icon, display_order) VALUES
-- Hero section
('hero', 'Creando valor a través de asociaciones estratégicas', 'Somos una gestora de capital privado especializada en adquisiciones de empresas medianas con potencial de crecimiento significativo.', NULL, NULL, NULL, NULL, 1),

-- KPIs
('kpi', NULL, NULL, NULL, '€150M+', 'Capital bajo gestión', 'Wallet', 1),
('kpi', NULL, NULL, NULL, '25+', 'Inversiones realizadas', 'Briefcase', 2),
('kpi', NULL, NULL, NULL, '40+', 'Add-ons ejecutados', 'GitMerge', 3),
('kpi', NULL, NULL, NULL, '15+', 'Años de experiencia', 'Clock', 4),

-- Strategy blocks
('strategy', 'Empresas en transición', 'Nos enfocamos en compañías con facturación de €5M-€50M, EBITDA positivo y equipos de gestión comprometidos.', 'Buscamos empresas rentables que busquen un socio para acelerar su crecimiento o facilitar procesos de sucesión.', NULL, NULL, 'Target', 1),
('strategy', 'Inversión activa', 'Tomamos posiciones mayoritarias o minoritarias significativas, trabajando codo a codo con los equipos directivos.', 'Aportamos capital, experiencia operativa y una red de contactos para impulsar el crecimiento.', NULL, NULL, 'Users', 2),
('strategy', 'Creación de valor', 'Implementamos mejoras operativas, apoyamos expansiones geográficas y facilitamos adquisiciones complementarias.', 'Nuestro enfoque hands-on genera retornos sostenibles a largo plazo.', NULL, NULL, 'TrendingUp', 3),

-- Value Creation metrics
('value_creation', NULL, NULL, 'Crecimiento medio de EBITDA en nuestras participadas', '>90%', 'Crecimiento EBITDA', 'TrendingUp', 1),
('value_creation', NULL, NULL, 'Mejora media del margen operativo', '+5pp', 'Mejora de márgenes', 'Target', 2),
('value_creation', NULL, NULL, 'Adquisiciones complementarias ejecutadas', '40+', 'Add-ons realizados', 'GitMerge', 3),
('value_creation', NULL, NULL, 'Incremento medio del empleo en participadas', '+35%', 'Creación de empleo', 'Users', 4),

-- ESG section
('esg', 'Inversión Responsable', 'Integramos criterios ESG en nuestro proceso de inversión y gestión de participadas.', 'Creemos que las empresas sostenibles generan mejores retornos a largo plazo. Aplicamos políticas de buen gobierno, medimos el impacto ambiental y fomentamos prácticas laborales responsables en todas nuestras inversiones.', NULL, NULL, 'Leaf', 1);