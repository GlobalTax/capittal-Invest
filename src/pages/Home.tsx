import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Meta } from "@/components/seo/Meta";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ArrowRight, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { VideoSlideshow } from "@/components/home/VideoSlideshow";

const Home = () => {
  const { trackCTAClick } = useAnalytics();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Fetch home content from database
  const { data: homeContent } = useQuery({
    queryKey: ['home-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  // Extract hero and KPIs from content
  const hero = homeContent?.find(c => c.section === 'hero');
  const kpis = homeContent
    ?.filter(c => c.section.startsWith('kpi_'))
    ?.sort((a, b) => a.display_order - b.display_order)
    ?.map(k => ({ value: k.value || '', label: k.label || '' })) || [
      { label: "Activos bajo Gestión", value: "€2.5bn" },
      { label: "Inversiones desde 2008", value: ">200" },
      { label: "Profesionales", value: "35" },
    ];

  const strategies = [
    {
      title: "Buy-outs",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=600&fit=crop",
      href: "/strategy",
    },
    {
      title: "Impacto",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop",
      href: "/strategy",
    },
    {
      title: "Capital a largo plazo",
      image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600&h=600&fit=crop",
      href: "/strategy",
    },
  ];

  return (
    <>
      <Meta
        title="Partners by nature"
        description="Capittal Invest es una firma de capital privado especializada en invertir y desarrollar compañías familiares y el middle-market."
        keywords="private equity, capital privado, inversión, growth equity"
        canonicalUrl={window.location.origin}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section - Full Screen with Video/Image */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={hero?.image_url || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"}
              alt="Nature background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-900/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-normal text-white mb-8 tracking-tight leading-none">
              {hero?.title || 'Partners by nature'}
            </h1>
            <button
              className="inline-flex items-center gap-3 text-white/90 hover:text-white transition-smooth group"
              onClick={() => {
                setIsVideoOpen(true);
                trackCTAClick("Watch Video", "Hero");
              }}
            >
              <span className="w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-smooth">
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              </span>
              <span className="text-sm font-medium uppercase tracking-widest">
                {hero?.subtitle?.split(' ').slice(0, 2).join(' ') || 'Ver el'}<br />{hero?.subtitle?.split(' ').slice(2).join(' ') || 'vídeo completo'}
              </span>
            </button>
          </div>

          {/* Video Modal */}
          <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
            <DialogContent className="max-w-5xl p-0 bg-black border-none [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-50">
              <div className="aspect-video w-full">
                <VideoSlideshow autoPlay onComplete={() => {}} />
              </div>
            </DialogContent>
          </Dialog>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-white/70 rounded-full" />
            </div>
          </div>
        </section>

        {/* La Firma Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-overline-miura mb-4">La Firma</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-normal text-foreground mb-8 leading-tight">
                Inversiones con propósito para desarrollar compañías perdurables
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl">
                Somos una firma de capital privado especializada en invertir y desarrollar 
                compañías familiares y el middle-market. Nuestro propósito es ser el socio 
                ideal de empresas líderes que generen valor sostenible e impacto positivo.
              </p>

              {/* KPIs - Miura style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                {kpis.map((kpi) => (
                  <div key={kpi.label} className="text-center md:text-left">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-foreground mb-2">
                      {kpi.value}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider">
                      {kpi.label}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
                onClick={() => trackCTAClick("Sobre nosotros", "La Firma")}
              >
                <Link to="/team">
                  Sobre nosotros
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Estrategias Section */}
        <section className="py-24 md:py-32 bg-neutral-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mb-16">
              <p className="text-overline-miura mb-4">Estrategias</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-normal text-foreground mb-8 leading-tight">
                Estrategia de inversión múltiple para apoyar compañías referentes
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                Aportamos atractivos planes de crecimiento e innovación con un claro 
                foco en la sostenibilidad en nuestras estrategias.
              </p>
            </div>

            {/* Strategy Cards - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {strategies.map((strategy) => (
                <Link
                  key={strategy.title}
                  to={strategy.href}
                  className="group relative aspect-square overflow-hidden"
                >
                  <img
                    src={strategy.image}
                    alt={strategy.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl md:text-2xl font-display text-white">
                      {strategy.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
            >
              <Link to="/portfolio">
                Compañías participadas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Sostenibilidad Section - Full width image */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Left - Content */}
            <div className="flex items-center bg-background p-8 md:p-16 lg:p-24">
              <div>
                <p className="text-overline-miura mb-4">Sostenibilidad</p>
                <h2 className="text-3xl md:text-4xl font-display font-normal text-foreground mb-6 leading-tight">
                  Inversión responsable para generar impacto a largo plazo
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Nos importa el legado que dejamos a las futuras generaciones y queremos 
                  contribuir al progreso socioeconómico y a la protección medioambiental.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  <Link to="/strategy">
                    Nuestro modelo de inversión
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative min-h-[400px] md:min-h-full">
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop"
                alt="Sostenibilidad"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Equipo Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Left - Image */}
            <div className="relative min-h-[400px] md:min-h-full order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=800&fit=crop"
                alt="Equipo"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Right - Content */}
            <div className="flex items-center bg-neutral-100 p-8 md:p-16 lg:p-24 order-1 md:order-2">
              <div>
                <p className="text-overline-miura mb-4">Equipo</p>
                <h2 className="text-3xl md:text-4xl font-display font-normal text-foreground mb-6 leading-tight">
                  Personas comprometidas con Personas
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Las personas somos catalizadoras del cambio, el progreso y la innovación. 
                  Apostamos por el talento, la creatividad y la experiencia de nuestros 
                  equipos para desarrollar e impulsar empresas líderes.
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  <Link to="/team">
                    Conoce al equipo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Últimas Noticias Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-normal text-foreground">
                Últimas noticias
              </h2>
              <Button
                asChild
                variant="ghost"
                className="text-foreground hover:text-muted-foreground"
              >
                <Link to="/news" className="inline-flex items-center gap-2">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* News placeholder - simple list style like Miura */}
            <div className="border-t border-border">
              {[1, 2, 3].map((i) => (
                <Link
                  key={i}
                  to="/news"
                  className="block py-8 border-b border-border group hover:bg-neutral-100/50 transition-smooth -mx-4 px-4"
                >
                  <div className="flex items-start justify-between gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="text-xl font-display text-foreground group-hover:text-muted-foreground transition-smooth">
                        Nueva inversión estratégica en el sector tecnológico
                      </h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-smooth flex-shrink-0 mt-2" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
