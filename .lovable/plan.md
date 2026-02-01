
# Plan: Actualizar Sectores de Inversión

## Objetivo
Cambiar los sectores de la aplicación a los tres sectores que os interesan:
1. **Servicios** - Empresas de servicios profesionales y B2B
2. **Food & Consumer** - Alimentación, bebidas y consumo
3. **Industriales y Distribución** - Industria manufacturera y logística

## Archivos a Modificar

### 1. Página de Sectores (`src/pages/Sectors.tsx`)
Actualizar los 4 sectores actuales por los 3 nuevos:

| Actual | Nuevo |
|--------|-------|
| Technology | Servicios |
| Consumer | Food & Consumer |
| Education | Industriales y Distribución |
| Services | (eliminar) |

Incluye:
- Iconos apropiados (Briefcase, UtensilsCrossed, Factory)
- Descripciones en español
- Meta description actualizada

### 2. Formulario de Admin (`src/components/admin/portfolio/CompanyForm.tsx`)
Actualizar el selector de sectores para reflejar las nuevas opciones:

```
Sector actual → Nuevo
Technology → Servicios
Healthcare → Food & Consumer
Finance → Industriales y Distribución
Consumer → (eliminar)
Industrial → (eliminar)
Energy → (eliminar)
```

### 3. Datos de Fallback (`src/data/fallbackData.ts`)
Actualizar las empresas de ejemplo para usar los nuevos sectores:
- NovaTech → Servicios
- BioHealth → Food & Consumer
- LogiTrans → Industriales y Distribución
- etc.

### 4. Base de Datos (Migración SQL)
Actualizar los sectores de las empresas existentes:

```sql
UPDATE portfolio_companies SET sector = 'Servicios' 
WHERE sector IN ('Technology', 'Healthcare', 'Industrial Services');

UPDATE portfolio_companies SET sector = 'Food & Consumer' 
WHERE sector IN ('Consumer', 'Energy');

UPDATE portfolio_companies SET sector = 'Industriales y Distribución' 
WHERE sector IN ('Logistics', 'Industrial', 'Education');
```

## Detalles Técnicos

### Iconos por Sector
| Sector | Icono Lucide |
|--------|--------------|
| Servicios | Briefcase |
| Food & Consumer | UtensilsCrossed |
| Industriales y Distribución | Factory |

### Descripciones Propuestas

**Servicios**
> Empresas de servicios profesionales, consultoría, outsourcing y soluciones B2B con modelos de ingresos recurrentes y potencial de escalabilidad.

**Food & Consumer**
> Marcas de alimentación, bebidas y productos de consumo con fuerte posicionamiento en el mercado ibérico y potencial de crecimiento internacional.

**Industriales y Distribución**
> Empresas manufactureras, de logística y distribución con operaciones eficientes y oportunidades de consolidación sectorial.

## Resultado Final

- La página `/sectors` mostrará solo 3 sectores
- El panel de admin permitirá seleccionar entre 3 sectores
- Todas las empresas existentes serán reasignadas automáticamente
- Los filtros del portfolio reflejarán los nuevos sectores
