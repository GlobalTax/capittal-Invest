import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw } from "lucide-react";

// Import slideshow images
import slide01 from "@/assets/slideshow/slide-01-legacy.jpg";
import slide02 from "@/assets/slideshow/slide-02-transition.jpg";
import slide03 from "@/assets/slideshow/slide-03-newbeginning.jpg";
import slide04 from "@/assets/slideshow/slide-04-partnership.jpg";
import slide05 from "@/assets/slideshow/slide-05-future.jpg";

interface Slide {
  image: string;
  title: string;
  subtitle?: string;
}

const slides: Slide[] = [
  {
    image: slide01,
    title: "Décadas construyendo un legado...",
  },
  {
    image: slide02,
    title: "Llega el momento de decidir su futuro",
  },
  {
    image: slide03,
    title: "Una nueva historia comienza",
  },
  {
    image: slide04,
    title: "Con el socio adecuado a tu lado",
  },
  {
    image: slide05,
    title: "Ethos Capital",
    subtitle: "Inversión con propósito",
  },
];

const SLIDE_DURATION = 5000; // 5 seconds per slide
const TRANSITION_DURATION = 1000; // 1 second fade transition

interface VideoSlideshowProps {
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function VideoSlideshow({ autoPlay = true, onComplete }: VideoSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      onComplete?.();
    }
  }, [currentSlide, onComplete]);

  const restart = useCallback(() => {
    setCurrentSlide(0);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Progress and slide advancement
  useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (SLIDE_DURATION / 50));
        if (newProgress >= 100) {
          nextSlide();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPlaying, nextSlide]);

  const isLastSlide = currentSlide === slides.length - 1;
  const isComplete = isLastSlide && !isPlaying && progress === 0;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
          style={{
            transitionDuration: `${TRANSITION_DURATION}ms`,
          }}
        >
          {/* Image with Ken Burns effect */}
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-transform",
              index === currentSlide && isPlaying && "animate-ken-burns"
            )}
            style={{
              backgroundImage: `url(${slide.image})`,
              animationDuration: `${SLIDE_DURATION}ms`,
            }}
          />

          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Text content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "text-center px-8 transition-all duration-700",
                index === currentSlide
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
              style={{
                transitionDelay: index === currentSlide ? "300ms" : "0ms",
              }}
            >
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-4 leading-tight">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-lg md:text-xl text-white/70 font-light tracking-wider">
                  {slide.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Progress bar */}
        <div className="flex gap-2 mb-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width:
                    index < currentSlide
                      ? "100%"
                      : index === currentSlide
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {isComplete && (
            <button
              onClick={restart}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Reiniciar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
