
# Plan: Sincronizar Datos de Fallback del Equipo

## Problema Identificado

Los datos del equipo en el fallback (`fallbackData.ts`) no coinciden con los miembros reales de la base de datos:

| Fuente | Miembros | Fotos |
|--------|----------|-------|
| **Supabase (real)** | Lluís Montanya, Samuel L. Navarro, Marc Ticó, Aleix Miró, etc. | URLs específicas del storage |
| **Fallback (estático)** | Carlos Martínez Vega, Elena Rodríguez Blanco (ficticios) | `null` - muestra iniciales |

## Solución Propuesta

Actualizar `fallbackData.ts` con los datos reales del equipo, incluyendo las URLs de las fotos del storage de Supabase.

### Ventajas
- Consistencia visual entre modo online y offline
- Los usuarios ven los mismos miembros del equipo
- Las fotos funcionarán mientras el storage de Supabase esté disponible (generalmente más resiliente que las consultas a tablas)

### Consideración
Si el storage de Supabase también está caído, las fotos no cargarán. Sin embargo, el componente ya maneja este caso mostrando las iniciales como fallback visual.

## Implementación

### Archivo a Modificar
`src/data/fallbackData.ts`

### Cambios
Reemplazar los 6 miembros ficticios actuales con los 8 miembros reales:

```typescript
export const fallbackTeamMembers: TeamMember[] = [
  {
    id: 'fallback-team-1',
    name: 'Lluís Montanya',
    position: 'M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718155505_qft99m.png',
    bio: 'Especialista en fusiones y adquisiciones con amplia experiencia en el mercado ibérico.',
    section: 'Equipo M&A',
    display_order: 1,
  },
  {
    id: 'fallback-team-2',
    name: 'Samuel L. Navarro',
    position: 'M&A - TAX Partner',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
    bio: 'Experto en fiscalidad de operaciones M&A y estructuración de transacciones.',
    section: 'Socios',
    display_order: 2,
  },
  // ... resto de miembros reales
];
```

### Miembros a Incluir (8 total)

1. **Lluís Montanya** - M&A
2. **Samuel L. Navarro** - M&A - TAX Partner
3. **Aleix Miró** - Abogado y Asesor Financiero
4. **Marc Ticó** - Asociado M&A
5. **Oriol Iglesias** - Analista M&A
6. **Marc Canet** - Analista M&A
7. **Albert Ticó** - Analista M&A
8. **Marcel Padrós** - Analista M&A

## Resultado Esperado

Cuando la base de datos no esté disponible:
- Se mostrarán los mismos miembros del equipo real
- Las fotos cargarán desde el storage (más resiliente)
- Si el storage también falla, se mostrarán las iniciales como respaldo visual
- El banner de "Mostrando datos de ejemplo" seguirá apareciendo

## Archivos Afectados

| Archivo | Acción |
|---------|--------|
| `src/data/fallbackData.ts` | Actualizar sección `fallbackTeamMembers` |
