

# Plan: Actualizar Menú del Admin Sidebar

## Problema
El menú lateral del admin todavía muestra el icono de película (Film) con la etiqueta "Video Slideshow", aunque el componente de video ya fue eliminado y esa sección gestiona el carrusel de imágenes del Hero.

## Cambios a Realizar

### Archivo: `src/components/admin/AdminSidebar.tsx`

| Línea | Actual | Nuevo |
|-------|--------|-------|
| 10 | `Film` | `Image` |
| 22 | `icon: Film, label: 'Video Slideshow'` | `icon: Image, label: 'Hero Carousel'` |

### Código Específico

**Import (línea 10):**
```diff
- Film,
+ Image,
```

**navItems (línea 22):**
```diff
- { path: '/admin/video', icon: Film, label: 'Video Slideshow' },
+ { path: '/admin/video', icon: Image, label: 'Hero Carousel' },
```

## Resultado
- El icono de película se reemplaza por un icono de imagen
- La etiqueta "Video Slideshow" cambia a "Hero Carousel"
- Refleja correctamente que esta sección gestiona el carrusel de imágenes del hero

