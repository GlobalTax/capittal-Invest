
# Plan: Fallback de Contenido Estático

## Objetivo
Implementar un sistema de datos de respaldo (fallback) para todas las páginas que dependen de Supabase, asegurando que la aplicación muestre contenido significativo cuando la base de datos no esté disponible.

## Análisis del Estado Actual

### Páginas que requieren fallback

| Página | Fuente de datos | ¿Tiene fallback? | Prioridad |
|--------|----------------|------------------|-----------|
| **Home** | `home_content`, `news_articles` | Parcial (solo KPIs y noticias) | Alta |
| **About** | `about_content` | No - muestra skeletons infinitos | Alta |
| **Portfolio** | `portfolio_companies` | No - muestra skeletons infinitos | Alta |
| **Team** | `team_members` | No - muestra skeletons infinitos | Alta |
| **Insights** | `news_articles` | Sí - usa `mockData.ts` | Completado |
| **HeroCarousel** | `video_slides` | Sí - usa `defaultSlides` | Completado |

### Recursos existentes
- `src/data/mockData.ts` ya contiene datos de ejemplo para Portfolio, Team e Insights
- El HeroCarousel ya implementa un patrón de fallback efectivo

## Implementación

### 1. Crear archivo centralizado de datos fallback

**Archivo:** `src/data/fallbackData.ts`

Contendrá datos estáticos de respaldo para:
- Contenido de About (hero, KPIs, estrategias, ESG)
- Contenido de Home (hero, KPIs)
- Empresas del portfolio
- Miembros del equipo (reutilizando/expandiendo mockData)

### 2. Modificar página About.tsx

Cambios:
- Importar datos fallback
- Modificar la consulta para usar `placeholderData` con los datos fallback
- Eliminar el estado de loading infinito cuando hay error
- Mostrar datos fallback si la consulta falla o devuelve vacío

Lógica:
```typescript
const { data: content, isLoading, isError } = useQuery({
  queryKey: ['about-content'],
  queryFn: async () => { ... },
  placeholderData: fallbackAboutContent, // Datos inmediatos
});

// Usar fallback si no hay datos
const displayContent = content?.length > 0 ? content : fallbackAboutContent;
```

### 3. Modificar página Portfolio.tsx

Cambios:
- Importar empresas fallback desde `fallbackData.ts`
- Modificar hooks `usePortfolioSearch` y `usePortfolioFilterOptions`
- Mostrar empresas fallback si Supabase no responde
- Actualizar las estadísticas para reflejar datos fallback

### 4. Modificar página Team.tsx

Cambios:
- Importar miembros fallback
- Modificar la consulta para incluir fallback
- Mostrar equipo de respaldo si la BD no responde

### 5. Modificar hooks de búsqueda

**Archivo:** `src/hooks/usePortfolioSearch.ts`

Añadir manejo de errores con fallback:
```typescript
return useQuery({
  queryKey: ["portfolio-search", params],
  queryFn: async () => { ... },
  placeholderData: fallbackPortfolioCompanies,
  retry: 1,
});
```

## Datos Fallback a Crear

### About Content
```typescript
const fallbackAboutContent = [
  { section: 'hero', title: 'Creando valor...', subtitle: '...' },
  { section: 'kpi', value: '12+', label: 'Años de Experiencia' },
  { section: 'kpi', value: '150+', label: 'Operaciones' },
  // ... más KPIs y estrategias
];
```

### Portfolio Companies
Expandir datos existentes en mockData con la estructura correcta de la BD

### Team Members
```typescript
const fallbackTeamMembers = [
  { name: 'Equipo Directivo', position: 'Liderazgo', ... },
  // Datos genéricos que indiquen al usuario que son datos de ejemplo
];
```

## Experiencia de Usuario

Cuando Supabase no esté disponible:
1. La página carga inmediatamente con datos fallback
2. Se muestra un banner sutil indicando "Mostrando datos de ejemplo"
3. No hay spinners infinitos ni páginas en blanco
4. El usuario puede navegar toda la aplicación

## Componente de aviso (opcional)

Crear un pequeño banner informativo:
```typescript
// src/components/ui/fallback-notice.tsx
const FallbackNotice = () => (
  <div className="bg-amber-50 text-amber-800 text-sm py-2 px-4 text-center">
    Mostrando datos de ejemplo. Algunos contenidos pueden no estar actualizados.
  </div>
);
```

## Archivos a Modificar/Crear

| Archivo | Acción |
|---------|--------|
| `src/data/fallbackData.ts` | Crear |
| `src/components/ui/fallback-notice.tsx` | Crear |
| `src/pages/About.tsx` | Modificar |
| `src/pages/Portfolio.tsx` | Modificar |
| `src/pages/Team.tsx` | Modificar |
| `src/hooks/usePortfolioSearch.ts` | Modificar |

## Detalles Técnicos

### Estrategia de React Query
- Usar `placeholderData` para datos inmediatos mientras se carga
- Mantener `staleTime` existente para caching
- Reducir `retry` a 1 para fallar rápido
- Usar el patrón `data || fallbackData` para garantizar contenido

### Detección de modo fallback
```typescript
const isUsingFallback = !content || content.length === 0 || isError;
```

### Estructura de datos
Los datos fallback seguirán exactamente la misma estructura que devuelve Supabase para evitar errores de tipado.

## Beneficios
- Experiencia fluida sin interrupciones
- Navegación completa offline-first
- Mejor percepción de velocidad de carga
- Reducción de errores visibles al usuario
