import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Sobre Nosotros", href: "/about" },
  { name: "Estrategias", href: "/strategy" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Equipo", href: "/team" },
  { name: "Noticias", href: "/news" },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHeroSection, setIsHeroSection] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  // Detect scroll for blur effect and hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      // Check if we're past the hero section (viewport height)
      setIsHeroSection(scrollY < window.innerHeight - 100);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset hero section state on route change
  useEffect(() => {
    setIsHeroSection(isHomePage);
  }, [location.pathname, isHomePage]);

  const shouldBeTransparent = isHomePage && isHeroSection && !scrolled;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      shouldBeTransparent 
        ? "bg-transparent border-transparent" 
        : "bg-background/95 backdrop-blur-md border-b border-border"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className={cn(
              "text-xl font-serif font-medium tracking-tight transition-colors duration-300",
              shouldBeTransparent ? "text-white" : "text-foreground"
            )}>
              Capittal Invest
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 relative py-2",
                  shouldBeTransparent
                    ? "text-white/80 hover:text-white"
                    : isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            <Button 
              asChild 
              variant={shouldBeTransparent ? "outline" : "default"}
              size="sm"
              className={cn(
                "rounded-none transition-all duration-300",
                shouldBeTransparent 
                  ? "border-white/50 text-white hover:bg-white hover:text-foreground bg-transparent" 
                  : ""
              )}
            >
              <Link to="/contact">Contacto</Link>
            </Button>
            <Link 
              to="/investor/login"
              className={cn(
                "text-sm font-medium transition-all duration-300 flex items-center gap-1.5",
                shouldBeTransparent
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              Inversores
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className={cn("h-6 w-6", shouldBeTransparent ? "text-white" : "text-foreground")} />
            ) : (
              <Menu className={cn("h-6 w-6", shouldBeTransparent ? "text-white" : "text-foreground")} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 text-base font-medium transition-smooth",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 pt-4 space-y-3">
              <Button asChild className="w-full rounded-none">
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Contacto
                </Link>
              </Button>
              <Link 
                to="/investor/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Lock className="h-3.5 w-3.5" />
                Portal Inversores
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
