import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

// Import slideshow images
import slide01 from "@/assets/slideshow/slide-01-legacy.jpg";
import slide02 from "@/assets/slideshow/slide-02-transition.jpg";
import slide03 from "@/assets/slideshow/slide-03-newbeginning.jpg";
import slide04 from "@/assets/slideshow/slide-04-partnership.jpg";
import slide05 from "@/assets/slideshow/slide-05-future.jpg";

interface HeroSlide {
  image: string;
  title: string;
  subtitle?: string;
  kenBurnsDirection?: "right" | "left" | "up" | "center";
}

interface KPI {
  value: string;
  label: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
  kpis?: KPI[];
  autoplayDelay?: number;
  title?: string;
}

const defaultSlides: HeroSlide[] = [
  { image: slide01, title: "Partners by nature", kenBurnsDirection: "right" },
  { image: slide02, title: "Partners by nature", kenBurnsDirection: "left" },
  { image: slide03, title: "Partners by nature", kenBurnsDirection: "up" },
  { image: slide04, title: "Partners by nature", kenBurnsDirection: "center" },
  { image: slide05, title: "Partners by nature", kenBurnsDirection: "right" },
];

const defaultKpis: KPI[] = [
  { value: "€2.5bn", label: "Activos bajo Gestión" },
  { value: ">200", label: "Inversiones desde 2008" },
  { value: "35", label: "Profesionales" },
];

export const HeroCarousel = ({
  slides = defaultSlides,
  kpis = defaultKpis,
  autoplayDelay = 6000,
  title,
}: HeroCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const autoplayPlugin = Autoplay({
    delay: autoplayDelay,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 50 },
    [autoplayPlugin]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0);
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Progress bar animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / (autoplayDelay / 50);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoplayDelay, selectedIndex]);

  const getKenBurnsClass = (direction?: string, isActive?: boolean) => {
    if (!isActive) return "";
    const duration = `${autoplayDelay}ms`;
    const base = {
      right: "animate-ken-burns-right",
      left: "animate-ken-burns-left",
      up: "animate-ken-burns-up",
      center: "animate-ken-burns-center",
    };
    return base[direction as keyof typeof base] || base.right;
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Carousel Container */}
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0 h-full"
            >
              {/* Background Image with Ken Burns */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={cn(
                    "w-full h-full object-cover",
                    getKenBurnsClass(slide.kenBurnsDirection, selectedIndex === index)
                  )}
                  style={{
                    animationDuration: `${autoplayDelay}ms`,
                  }}
                />
              </div>
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-neutral-900/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Content - Title centered */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-normal text-white tracking-tight leading-none">
            {title || slides[selectedIndex]?.title || "Partners by nature"}
          </h1>
        </div>
      </div>

      {/* KPIs - Bottom left */}
      <div className="absolute bottom-16 md:bottom-20 left-8 md:left-12 lg:left-16 z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          {kpis.map((kpi, index) => (
            <div key={index} className="text-white">
              <div className="text-3xl md:text-4xl lg:text-5xl font-display font-normal mb-1">
                {kpi.value}
              </div>
              <div className="text-xs md:text-sm text-white/70 uppercase tracking-wider">
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Indicators - Bottom right (Portobello style) */}
      <div className="absolute bottom-16 md:bottom-20 right-8 md:right-12 lg:right-16 z-10">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="group relative h-1 w-12 md:w-16 bg-white/30 overflow-hidden cursor-pointer"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 bg-white transition-all duration-100",
                  selectedIndex === index ? "opacity-100" : "opacity-0"
                )}
                style={{
                  width: selectedIndex === index ? `${progress}%` : "0%",
                }}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-white/60 transition-opacity",
                  selectedIndex === index ? "opacity-0" : "group-hover:opacity-100 opacity-0"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator - Bottom center */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-scroll-fade z-10">
        <div className="w-6 h-10 rounded-full border border-white/40 flex items-start justify-center pt-2 backdrop-blur-sm">
          <div className="w-1 h-2 bg-white/80 rounded-full animate-scroll-wheel" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-white/60 font-light">
          Scroll
        </span>
      </div>
    </section>
  );
};
