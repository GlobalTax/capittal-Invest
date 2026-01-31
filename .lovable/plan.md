

## Plan: Reemplazar Hero con Video por Hero con Carrusel estilo Portobello

### Referencia Visual

El carrusel de Portobello tiene:
- Slides fullscreen con imágenes de fondo
- Transicion suave entre slides (fade o slide)
- Titulo grande con tipografia serif
- KPIs destacados superpuestos (€3.7bn, +25 años, +60 inversiones)
- Indicadores de progreso (barras horizontales) en la parte inferior
- Auto-avance con pausa al hover

### Recursos Existentes

El proyecto ya tiene:
- 5 imagenes de slideshow en `src/assets/slideshow/`
- Animaciones Ken Burns definidas en `index.css`
- Componente `VideoSlideshow.tsx` (se puede reutilizar logica)
- KPIs configurados en la tabla `home_content` (€2.5bn, >200, 35)
- Embla Carousel instalado como dependencia

---

## Cambios a Implementar

### 1. Crear componente HeroCarousel

**Archivo:** `src/components/home/HeroCarousel.tsx`

Nuevo componente que reemplazara la seccion Hero actual:

```text
+------------------------------------------------------------------+
|                                                                  |
|      Construimos                                                 |
|      empresas líderes                                            |
|                                                                  |
|   €2.5bn        >200          35                                 |
|   Activos      Inversiones   Profesionales                       |
|   bajo gestión desde 2008                                        |
|                                                                  |
|   [===][    ][    ]     <- indicadores de slide                  |
+------------------------------------------------------------------+
```

Caracteristicas:
- Fullscreen (h-screen) con imagen de fondo
- Efecto Ken Burns en las imagenes
- Auto-avance cada 5-7 segundos
- KPIs superpuestos en la parte inferior izquierda
- Indicadores de progreso estilo barras (como Portobello)
- Pausa al hacer hover o click
- Transicion suave entre slides

### 2. Configurar slides del carrusel

Cada slide tendra:
- Imagen de fondo (reutilizar assets existentes o nuevas)
- Titulo principal (configurable)
- Subtitulo opcional

Se puede leer de la tabla `video_slides` existente o de `home_content` con seccion `hero_slide_X`.

### 3. Modificar Home.tsx

Reemplazar la seccion Hero actual (lineas 98-164):
- Eliminar el video player
- Eliminar el boton "Ver video completo"
- Insertar el nuevo componente `HeroCarousel`
- Mover los KPIs dentro del carrusel
- Mantener el scroll indicator

### 4. Estilos y animaciones

Reutilizar las animaciones Ken Burns existentes en `index.css`.

Añadir si es necesario:
- Transicion de slide (fade entre imagenes)
- Animacion de entrada del texto

---

## Estructura del Componente

```typescript
// HeroCarousel.tsx

interface HeroSlide {
  image: string;
  title: string;
  subtitle?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  kpis: { value: string; label: string }[];
  autoplayDelay?: number; // default 6000ms
}

// Usa Embla Carousel con autoplay
// Cada slide:
//   - Imagen de fondo con Ken Burns
//   - Overlay oscuro para legibilidad
//   - Contenido centrado (titulo)
//   - KPIs en la parte inferior izquierda
//   - Indicadores de progreso en la parte inferior
```

---

## Archivos Afectados

| Archivo | Accion |
|---------|--------|
| `src/components/home/HeroCarousel.tsx` | Crear - Nuevo componente de carrusel |
| `src/pages/Home.tsx` | Modificar - Reemplazar Hero por HeroCarousel |
| `src/index.css` | Posible - Añadir animacion de fade si es necesario |

---

## Datos del Carrusel

**Opcion A - Usar slides existentes:**
Reutilizar la tabla `video_slides` que ya tiene 5 slides configurados.

**Opcion B - Crear nueva tabla:**
`hero_slides` con campos: image_url, title, subtitle, position, is_active.

**Recomendacion:** Empezar con Opcion A para reutilizar datos existentes.

---

## Notas Tecnicas

- El carrusel usara `embla-carousel-react` (ya instalado)
- Opcional: plugin `embla-carousel-autoplay` para auto-avance
- Los KPIs se muestran sobre todos los slides (no cambian entre slides, como en Portobello)
- El scroll indicator se mantiene en la parte inferior central
- Responsive: en mobile los KPIs se apilan verticalmente

