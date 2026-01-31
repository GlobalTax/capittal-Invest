import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Meta } from "@/components/seo/Meta";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HeroCarousel } from "@/components/home/HeroCarousel";

const Home = () => {
  const { trackCTAClick } = useAnalytics();

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
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (previousData) => previousData,
  });

  // Fetch recent news from database
  const { data: recentNews } = useQuery({
    queryKey: ['recent-news-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, slug, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos para noticias
  });

  // Extract hero and KPIs from content
  const hero = homeContent?.find(c => c.section === 'hero');
  const kpis = homeContent
    ?.filter(c => c.section.startsWith('kpi_'))
    ?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
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

  // Fallback news if none from database
  const displayNews = recentNews && recentNews.length > 0 
    ? recentNews 
    : [
        { id: '1', title: 'Nueva inversión estratégica en el sector tecnológico', slug: '', published_at: new Date().toISOString() },
        { id: '2', title: 'Expansión internacional de nuestra cartera de participadas', slug: '', published_at: new Date().toISOString() },
        { id: '3', title: 'Resultados récord en el primer trimestre del año', slug: '', published_at: new Date().toISOString() },
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
        {/* Hero Section - Carousel */}
        <HeroCarousel 
          kpis={kpis}
          title={hero?.title}
        />

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

            {/* News list from database */}
            <div className="border-t border-border">
              {displayNews.map((news) => (
                <Link
                  key={news.id}
                  to={news.slug ? `/insights/${news.slug}` : "/news"}
                  className="block py-8 border-b border-border group hover:bg-neutral-100/50 transition-smooth -mx-4 px-4"
                >
                  <div className="flex items-start justify-between gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(news.published_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="text-xl font-display text-foreground group-hover:text-muted-foreground transition-smooth">
                        {news.title}
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
