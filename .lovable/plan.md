

# Plan: Eliminar Botón Play/Pause del Hero Carousel

## Problema
El carrusel del hero tiene un botón grande de Play/Pause que aparece en el centro al hacer hover. Aunque es para controlar el autoplay del carrusel de imágenes, visualmente parece un botón de "video" que confunde al usuario.

## Cambios a Realizar

### Archivo: `src/components/home/HeroCarousel.tsx`

**1. Eliminar imports no usados (línea 7):**
```diff
- import { Pause, Play } from "lucide-react";
```

**2. Eliminar estados relacionados (líneas 92-93):**
```diff
- const [isPaused, setIsPaused] = useState(false);
- const [showPauseIndicator, setShowPauseIndicator] = useState(false);
```

**3. Eliminar handlers de pause/play (líneas 155-174):**
- Eliminar `handleMouseEnter`
- Eliminar `handleMouseLeave`  
- Eliminar `togglePlayPause`

**4. Simplificar el section (líneas 177-181):**
```diff
  <section 
    className="relative h-screen w-full overflow-hidden group/carousel"
-   onMouseEnter={handleMouseEnter}
-   onMouseLeave={handleMouseLeave}
  >
```

**5. Eliminar el botón Pause/Play (líneas 274-291):**
Eliminar completamente el bloque del botón circular con Play/Pause.

## Resultado
- El carrusel seguirá funcionando con autoplay automático
- Se mantiene la pausa automática al hacer hover (comportamiento de Embla)
- Desaparece el botón visual de Play/Pause que confundía
- Experiencia más limpia e inmersiva

