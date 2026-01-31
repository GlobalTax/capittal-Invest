import { useEffect, useRef, useState, RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

interface ScrollAnimationResult {
  ref: RefObject<HTMLDivElement>;
  isVisible: boolean;
}

/**
 * Hook para detectar cuando un elemento entra en el viewport
 * Usa IntersectionObserver para rendimiento óptimo
 */
export const useScrollAnimation = (options: ScrollAnimationOptions = {}): ScrollAnimationResult => {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isVisible };
};

export default useScrollAnimation;
