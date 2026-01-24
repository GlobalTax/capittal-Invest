-- Fix the search vector trigger to use correct column names
-- The trigger references old column names (company_name, industry) that don't exist

CREATE OR REPLACE FUNCTION update_portfolio_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.sector, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Now insert the 3 fictional portfolio companies for testing

INSERT INTO public.portfolio_companies (
  name,
  slug,
  sector,
  stage,
  country,
  description,
  website_url,
  founded_year,
  investment_date,
  investment_thesis,
  metrics,
  timeline,
  is_active,
  is_featured,
  display_order
) VALUES 
(
  'NovaTech Solutions',
  'novatech-solutions',
  'Technology',
  'Series A',
  'Spain',
  'Plataforma SaaS de automatización de procesos empresariales con inteligencia artificial para PYMEs.',
  'https://novatech-solutions.example.com',
  2021,
  '2023-03-15',
  'Líder emergente en automatización empresarial con tecnología propietaria de IA. Fuerte tracción en el mercado ibérico con 150+ clientes activos y crecimiento MRR del 25% mensual.',
  '{"revenue": "2.5M€ ARR", "employees": "45", "valuation": "15M€"}',
  '[{"date": "2021-06", "event": "Fundación de la empresa"}, {"date": "2022-09", "event": "Lanzamiento de producto MVP"}, {"date": "2023-03", "event": "Ronda Series A - 5M€"}]',
  true,
  true,
  1
),
(
  'BioHealth Diagnostics',
  'biohealth-diagnostics',
  'Healthcare',
  'Series B',
  'Portugal',
  'Dispositivos de diagnóstico rápido point-of-care para enfermedades infecciosas con resultados en menos de 15 minutos.',
  'https://biohealth-dx.example.com',
  2019,
  '2022-11-20',
  'Tecnología patentada de diagnóstico molecular con aprobación CE-IVD. Contratos con 3 sistemas nacionales de salud europeos y pipeline de 5 nuevos tests en desarrollo.',
  '{"revenue": "8M€ ARR", "employees": "120", "valuation": "45M€"}',
  '[{"date": "2019-02", "event": "Fundación de la empresa"}, {"date": "2020-08", "event": "Aprobación CE-IVD"}, {"date": "2021-05", "event": "Ronda Series A - 3M€"}, {"date": "2022-11", "event": "Ronda Series B - 12M€"}]',
  true,
  true,
  2
),
(
  'GreenEnergy Storage',
  'greenenergy-storage',
  'Energy',
  'Seed',
  'Spain',
  'Soluciones innovadoras de almacenamiento de energía basadas en baterías de estado sólido para instalaciones renovables.',
  'https://greenenergy-storage.example.com',
  2023,
  '2024-01-10',
  'Equipo fundador con experiencia en Tesla y CATL. Tecnología de baterías de estado sólido con 40% más densidad energética que soluciones actuales. Primera planta piloto operativa en Q2 2024.',
  '{"revenue": "Pre-revenue", "employees": "12", "valuation": "3M€"}',
  '[{"date": "2023-04", "event": "Fundación de la empresa"}, {"date": "2023-09", "event": "Prototipo funcional completado"}, {"date": "2024-01", "event": "Ronda Seed - 1.5M€"}]',
  true,
  false,
  3
);