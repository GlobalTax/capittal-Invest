

## Plan: Añadir Animaciones de Entrada por Scroll a la Página Sobre Nosotros

### Objetivo

Añadir animaciones de entrada elegantes a cada sección de la página About cuando aparecen en el viewport durante el scroll, creando una experiencia visual más dinámica y profesional.

---

## Animaciones a Implementar

### Tipos de Animaciones por Sección

| Seccion | Animacion | Efecto |
|---------|-----------|--------|
| Hero | fade-up | Titulo y subtitulo aparecen desde abajo |
| KPIs | fade-up escalonado | Cada tarjeta aparece con delay incremental |
| Strategy | slide-in-left/right | Cards entran alternando desde los lados |
| Value Creation | scale-fade | Numeros aparecen con efecto de escala |
| ESG | fade-in-left | Icono e información entran desde la izquierda |
| CTA | fade-up | Seccion aparece desde abajo |

---

## Cambios a Implementar

### 1. Crear hook personalizado useScrollAnimation

**Archivo:** `src/hooks/useScrollAnimation.ts` (nuevo)

Hook reutilizable que detecta cuando un elemento entra en el viewport:

```typescript
// Retorna ref y estado isVisible
// Usa IntersectionObserver con threshold configurable
// Opcion triggerOnce para animar solo la primera vez
```

### 2. Añadir nuevas animaciones en tailwind.config.ts

**Keyframes nuevos:**

```text
slide-in-left: translateX(-30px) -> translateX(0) + fade
slide-in-right: translateX(30px) -> translateX(0) + fade  
scale-fade: scale(0.9) + opacity(0) -> scale(1) + opacity(1)
fade-in: opacity(0) -> opacity(1)
```

### 3. Actualizar About.tsx con animaciones

**Modificaciones:**

- Envolver cada seccion en componente animado
- Hero: fade-up con delay en subtitulo
- KPIs: fade-up con stagger (75ms por tarjeta)
- Strategy Cards: slide-in alternando direccion
- Value Creation: scale-fade con stagger
- ESG: slide-in-left
- CTA: fade-up

---

## Implementacion Detallada

### Hook useScrollAnimation

```typescript
import { useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export const useScrollAnimation = (options: Options = {}) => {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isVisible };
};
```

### Componente AnimatedSection

```typescript
// Wrapper reutilizable para secciones
const AnimatedSection = ({ 
  children, 
  animation = 'fade-up',
  delay = 0,
  className 
}) => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isVisible ? `animate-${animation}` : "opacity-0 translate-y-6",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
```

---

## Archivos Afectados

| Archivo | Accion |
|---------|--------|
| `src/hooks/useScrollAnimation.ts` | Crear - Hook de scroll animation |
| `tailwind.config.ts` | Modificar - Añadir keyframes y animaciones |
| `src/pages/About.tsx` | Modificar - Aplicar animaciones a secciones |

---

## Experiencia Visual Esperada

1. **Al cargar la pagina**: Hero visible inmediatamente con fade-up sutil
2. **Scroll a KPIs**: Tarjetas aparecen una tras otra (efecto cascada)
3. **Scroll a Strategy**: Cards entran desde los lados alternando
4. **Scroll a Value Creation**: Numeros aparecen con escala dinamica
5. **Scroll a ESG**: Contenido desliza desde la izquierda
6. **Scroll a CTA**: Boton y texto aparecen desde abajo

---

## Notas Tecnicas

- Usamos `IntersectionObserver` nativo (mejor rendimiento que scroll events)
- Animaciones CSS con `animation-fill-mode: forwards` para mantener estado final
- `triggerOnce: true` evita re-animaciones al scrollear arriba/abajo
- Delays escalonados (stagger) calculados dinamicamente con index * 75ms
- Transiciones de 500-700ms para sensacion premium sin ser lentas

