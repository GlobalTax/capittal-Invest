-- Reasignar empresas existentes a los nuevos sectores

-- Sector "Servicios" - empresas de tecnología, servicios industriales y consultoría
UPDATE portfolio_companies SET sector = 'Servicios' 
WHERE sector IN ('Technology', 'Healthcare', 'Industrial Services');

-- Sector "Food & Consumer" - alimentación, bebidas y consumo
UPDATE portfolio_companies SET sector = 'Food & Consumer' 
WHERE sector IN ('Consumer', 'Energy');

-- Sector "Industriales y Distribución" - logística, industrial y manufacturing
UPDATE portfolio_companies SET sector = 'Industriales y Distribución' 
WHERE sector IN ('Logistics', 'Industrial', 'Education');