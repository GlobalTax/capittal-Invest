

## Plan: Optimizar Tiempos de Carga de Páginas

### Problema Identificado

Las páginas muestran skeletons de carga cada vez que navegas porque:

1. Las queries de React Query no tienen `staleTime` configurado (excepto en Portfolio)
2. Cada navegación dispara nuevas peticiones a Supabase
3. No hay datos en caché que mostrar inmediatamente

### Solución Propuesta

Optimizar la configuración de React Query para cachear datos y mostrar contenido inmediatamente.

---

## Cambios a Implementar

### 1. Configurar QueryClient con defaults globales

**Archivo:** `src/App.tsx`

Añadir configuración de caché global al QueryClient:

**Antes:**
```typescript
const queryClient = new QueryClient();
```

**Después:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto - datos se consideran frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché
      refetchOnWindowFocus: false, // No recargar al volver a la ventana
      retry: 1, // Solo 1 reintento en caso de error
    },
  },
});
```

### 2. Optimizar página About

**Archivo:** `src/pages/About.tsx`

Añadir `staleTime` y `placeholderData` a la query:

```typescript
const { data: content, isLoading } = useQuery({
  queryKey: ['about-content'],
  queryFn: async () => { /* ... */ },
  staleTime: 5 * 60 * 1000, // 5 minutos
  placeholderData: (previousData) => previousData,
});
```

### 3. Optimizar página Home

**Archivo:** `src/pages/Home.tsx`

Añadir configuración de caché a ambas queries:

```typescript
const { data: homeContent } = useQuery({
  queryKey: ['home-content'],
  queryFn: async () => { /* ... */ },
  staleTime: 5 * 60 * 1000,
  placeholderData: (previousData) => previousData,
});

const { data: recentNews } = useQuery({
  queryKey: ['recent-news-home'],
  queryFn: async () => { /* ... */ },
  staleTime: 2 * 60 * 1000, // 2 minutos para noticias
});
```

### 4. Optimizar hook useNewsSearch

**Archivo:** `src/hooks/useNewsSearch.ts`

Añadir `staleTime` y optimizaciones:

```typescript
export const useNewsSearch = (params: NewsSearchParams) => {
  return useQuery({
    queryKey: ["news-search", params],
    queryFn: async () => { /* ... */ },
    staleTime: 60 * 1000, // 1 minuto
    placeholderData: (previousData) => previousData,
  });
};
```

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Configurar QueryClient con defaults globales |
| `src/pages/About.tsx` | Añadir staleTime y placeholderData |
| `src/pages/Home.tsx` | Añadir staleTime a queries |
| `src/hooks/useNewsSearch.ts` | Añadir staleTime y placeholderData |

---

## Resultado Esperado

- Primera visita: carga normal con skeletons (inevitable)
- Navegación posterior: contenido aparece inmediatamente desde caché
- Datos se refrescan en segundo plano sin mostrar loading
- Reducción significativa de peticiones a Supabase

---

## Notas Técnicas

- `staleTime`: tiempo que los datos se consideran frescos (no refetch)
- `gcTime` (antes cacheTime): tiempo que permanecen en memoria
- `placeholderData`: muestra datos anteriores mientras carga nuevos
- `refetchOnWindowFocus: false`: evita recargas innecesarias al volver a la pestaña

