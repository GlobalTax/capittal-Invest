
# Plan: Eliminar Componente VideoSlideshow

## Resumen
Eliminar el componente `VideoSlideshow` que ya no se utiliza en la página principal, junto con su funcionalidad de preview en el panel de administración.

## Archivos a Modificar

### 1. Eliminar Archivo
| Archivo | Acción |
|---------|--------|
| `src/components/home/VideoSlideshow.tsx` | **Eliminar completamente** |

### 2. Actualizar Admin (`src/pages/admin/AdminVideoSlides.tsx`)
Eliminar la funcionalidad de preview que usa `VideoSlideshow`:

**Cambios:**
- Línea 26: Eliminar `import { VideoSlideshow }`
- Línea 51: Eliminar estado `isPreviewOpen`
- Líneas 237-247: Eliminar el Dialog de preview con el botón "Preview"

**Resultado:** El admin seguirá funcionando para gestionar los slides (que usa `HeroCarousel`), pero sin el botón de preview del video que ya no existe.

## Notas Técnicas

- El `HeroCarousel` de la Home **NO se ve afectado** - sigue funcionando con los slides de la base de datos
- La tabla `video_slides` y el admin para gestionarla se mantienen porque alimentan el carrusel actual
- Solo eliminamos el componente de video que no se usa
