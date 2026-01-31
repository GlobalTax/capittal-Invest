import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meta } from '@/components/seo/Meta';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Target, TrendingUp, Users, Wallet, Briefcase, GitMerge, Clock, Leaf, ArrowRight,
  Factory, Recycle, TreeDeciduous, CloudSun, CheckCircle, Building2,
  LucideIcon
} from 'lucide-react';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { fallbackAboutContent, AboutContent } from '@/data/fallbackData';
import { FallbackNotice } from '@/components/ui/fallback-notice';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Target, TrendingUp, Users, Wallet, Briefcase, GitMerge, Clock, Leaf
};

// AboutContent interface is now imported from fallbackData

// Animated Section wrapper component
interface AnimatedSectionProps {
  children: ReactNode;
  animation?: 'fade-up' | 'slide-in-left' | 'slide-in-right' | 'scale-fade' | 'fade-in';
  delay?: number;
  className?: string;
}

const AnimatedSection = ({ 
  children, 
  animation = 'fade-up',
  delay = 0,
  className 
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  
  const animationClass = {
    'fade-up': 'animate-fade-up',
    'slide-in-left': 'animate-slide-in-left',
    'slide-in-right': 'animate-slide-in-right',
    'scale-fade': 'animate-scale-fade',
    'fade-in': 'animate-fade-in',
  }[animation];

  const initialClass = {
    'fade-up': 'opacity-0 translate-y-5',
    'slide-in-left': 'opacity-0 -translate-x-8',
    'slide-in-right': 'opacity-0 translate-x-8',
    'scale-fade': 'opacity-0 scale-95',
    'fade-in': 'opacity-0',
  }[animation];
  
  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? animationClass : initialClass,
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
};

// Animated counter component - Fixed to handle special characters properly
const AnimatedValue = ({ value, className }: { value: string; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateValue();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const animateValue = () => {
    // Extract numeric part - match the first sequence of digits (with optional decimal)
    const numericMatch = value.match(/(\d+(?:[.,]\d+)?)/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const numericStr = numericMatch[0].replace(',', '.');
    const numericValue = parseFloat(numericStr);
    const matchIndex = value.indexOf(numericMatch[0]);
    const prefix = value.slice(0, matchIndex);
    const suffix = value.slice(matchIndex + numericMatch[0].length);
    
    // Check if original had comma for decimal
    const useComma = numericMatch[0].includes(',');
    
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    // Start from 0
    setDisplayValue(`${prefix}0${suffix}`);

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      let currentValue: string;
      
      if (Number.isInteger(numericValue)) {
        currentValue = Math.round(numericValue * easeOut).toString();
      } else {
        const current = numericValue * easeOut;
        currentValue = current.toFixed(1);
        if (useComma) {
          currentValue = currentValue.replace('.', ',');
        }
      }
      
      setDisplayValue(`${prefix}${currentValue}${suffix}`);

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, stepDuration);
  };

  return <span ref={ref} className={className}>{displayValue}</span>;
};

// KPI Card component with animation delay support
const KPICard = ({ value, label, icon, delay = 0 }: { value: string; label: string; icon: string | null; delay?: number }) => {
  const Icon = icon ? iconMap[icon] : null;
  
  return (
    <AnimatedSection animation="fade-up" delay={delay}>
      <div className="text-center p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full">
        {Icon && (
          <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <AnimatedValue 
          value={value} 
          className="block text-4xl md:text-5xl font-normal text-foreground mb-2"
        />
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </AnimatedSection>
  );
};

// Strategy Block component with animation support
const StrategyBlock = ({ 
  title, 
  subtitle, 
  content, 
  icon,
  animation = 'slide-in-left',
  delay = 0
}: { 
  title: string; 
  subtitle: string; 
  content: string | null;
  icon: string | null;
  animation?: 'slide-in-left' | 'slide-in-right';
  delay?: number;
}) => {
  const Icon = icon ? iconMap[icon] : Target;
  
  return (
    <AnimatedSection animation={animation} delay={delay}>
      <Card className="p-8 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 h-full">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-normal text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-3">{subtitle}</p>
            {content && <p className="text-sm text-muted-foreground/80">{content}</p>}
          </div>
        </div>
      </Card>
    </AnimatedSection>
  );
};

// Value metric component with scale animation
const ValueMetric = ({ value, label, content, delay = 0 }: { 
  value: string; 
  label: string; 
  content: string | null;
  delay?: number;
}) => {
  return (
    <AnimatedSection animation="scale-fade" delay={delay}>
      <div className="text-center">
        <AnimatedValue 
          value={value} 
          className="block text-4xl md:text-5xl font-normal text-background mb-2"
        />
        <p className="font-normal text-background mb-1">{label}</p>
        {content && (
          <p className="text-sm text-background/60">{content}</p>
        )}
      </div>
    </AnimatedSection>
  );
};

// SDG Card types and data
interface SDGCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  delay?: number;
}

const sdgItems: Omit<SDGCardProps, 'delay'>[] = [
  { icon: Briefcase, title: 'ODS 8', description: 'Trabajo Decente', color: '#a21942' },
  { icon: Factory, title: 'ODS 9', description: 'Industria e Innovación', color: '#fd6925' },
  { icon: Recycle, title: 'ODS 12', description: 'Consumo Responsable', color: '#bf8b2e' },
  { icon: TreeDeciduous, title: 'ODS 13', description: 'Acción Climática', color: '#3f7e44' },
];

// SDG Card component
const SDGCard = ({ icon: Icon, title, description, color, delay = 0 }: SDGCardProps) => (
  <AnimatedSection animation="scale-fade" delay={delay}>
    <div 
      className="group text-center p-6 rounded-xl border-2 border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card hover:scale-105"
      style={{ borderColor: `${color}40` }}
    >
      <div 
        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </AnimatedSection>
);

// ESG Timeline data and component
const esgMilestones = [
  { year: '2020', title: 'Política ESG', desc: 'Integración de criterios' },
  { year: '2022', title: 'Certificación', desc: 'Estándares internacionales' },
  { year: '2024', title: 'Carbon Neutral', desc: 'Huella cero' },
  { year: '2025', title: 'Fondo Impacto', desc: 'Inversión sostenible' },
];

const ESGTimeline = () => (
  <div className="relative py-8 max-w-4xl mx-auto">
    {/* Connector line */}
    <div className="absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-green-300 via-green-500 to-green-600 hidden md:block" />
    
    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
      {esgMilestones.map((m, i) => (
        <AnimatedSection key={m.year} animation="scale-fade" delay={i * 150}>
          <div className="flex flex-col items-center text-center">
            <div className="w-6 h-6 rounded-full bg-green-500 ring-4 ring-green-100 dark:ring-green-900/50 mb-4 relative z-10" />
            <span className="text-xl font-semibold text-foreground">{m.year}</span>
            <span className="text-sm font-medium text-foreground mt-1">{m.title}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{m.desc}</span>
          </div>
        </AnimatedSection>
      ))}
    </div>
  </div>
);

// ESG Metrics data and component
interface ESGMetricProps {
  value: string;
  label: string;
  icon: LucideIcon;
  delay?: number;
}

const esgMetrics: Omit<ESGMetricProps, 'delay'>[] = [
  { value: '-30%', label: 'Reducción CO2', icon: CloudSun },
  { value: '85%', label: 'Participadas con Plan ESG', icon: CheckCircle },
  { value: '100%', label: 'Gobernanza Mejorada', icon: Building2 },
  { value: '+500', label: 'Empleos Creados', icon: Users },
];

const ESGMetric = ({ value, label, icon: Icon, delay = 0 }: ESGMetricProps) => (
  <AnimatedSection animation="fade-up" delay={delay}>
    <div className="text-center">
      <Icon className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
      <AnimatedValue 
        value={value} 
        className="block text-3xl font-semibold text-foreground mb-1" 
      />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </AnimatedSection>
);

const About = () => {
  const { data: content, isLoading, isError } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as AboutContent[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: fallbackAboutContent,
    retry: 1,
  });

  // Use fallback if no data or error
  const displayContent = (content && content.length > 0) ? content : fallbackAboutContent;
  const isUsingFallback = !content || content.length === 0 || isError;

  if (isLoading && !displayContent) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-16" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hero = displayContent?.find(c => c.section === 'hero');
  const kpis = displayContent?.filter(c => c.section === 'kpi').sort((a, b) => a.display_order - b.display_order) || [];
  const strategies = displayContent?.filter(c => c.section === 'strategy').sort((a, b) => a.display_order - b.display_order) || [];
  const valueCreation = displayContent?.filter(c => c.section === 'value_creation').sort((a, b) => a.display_order - b.display_order) || [];
  const esg = displayContent?.find(c => c.section === 'esg');

  return (
    <>
      <Meta 
        title="Sobre Nosotros"
        description="Gestora de capital privado especializada en adquisiciones estratégicas de empresas medianas con potencial de crecimiento."
        canonicalUrl="https://ethos-venture.lovable.app/about"
      />

      {/* Fallback Notice */}
      {isUsingFallback && <FallbackNotice />}

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-up" delay={0}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mb-6 leading-tight">
                {hero?.title || 'Creando valor a través de asociaciones estratégicas'}
              </h1>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={150}>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {hero?.subtitle || 'Somos una gestora de capital privado especializada en adquisiciones de empresas medianas con potencial de crecimiento significativo.'}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* KPIs Section */}
      {kpis.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {kpis.map((kpi, index) => (
                <KPICard 
                  key={kpi.id}
                  value={kpi.value || '0'}
                  label={kpi.label || ''}
                  icon={kpi.icon}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Strategy Section */}
      {strategies.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">
                Nuestra Estrategia de Inversión
              </h2>
              <p className="text-muted-foreground text-lg">
                Nos asociamos con empresarios y equipos directivos para acelerar el crecimiento y crear valor sostenible.
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {strategies.map((strategy, index) => (
                <StrategyBlock
                  key={strategy.id}
                  title={strategy.title || ''}
                  subtitle={strategy.subtitle || ''}
                  content={strategy.content}
                  icon={strategy.icon}
                  animation={index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value Creation Section */}
      {valueCreation.length > 0 && (
        <section className="py-20 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-normal mb-4">
                Nuestro Impacto
              </h2>
              <p className="text-background/70 text-lg">
                Resultados medios en nuestras participadas durante el periodo de inversión.
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {valueCreation.map((metric, index) => (
                <ValueMetric
                  key={metric.id}
                  value={metric.value || '0'}
                  label={metric.label || ''}
                  content={metric.content}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ESG Section - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">
              {esg?.title || 'Inversión Responsable'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {esg?.subtitle || 'Integramos criterios ESG en todas nuestras decisiones de inversión'}
            </p>
            {esg?.content && (
              <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
                {esg.content}
              </p>
            )}
          </AnimatedSection>

          {/* SDG Grid */}
          <div className="mb-20">
            <AnimatedSection animation="fade-up" className="text-center mb-8">
              <h3 className="text-xl font-normal text-foreground">
                Objetivos de Desarrollo Sostenible
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Contribuimos activamente a los ODS de las Naciones Unidas
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {sdgItems.map((sdg, i) => (
                <SDGCard key={sdg.title} {...sdg} delay={i * 100} />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <AnimatedSection animation="fade-up" className="mb-20">
            <h3 className="text-center text-xl font-normal text-foreground mb-2">
              Nuestro Camino ESG
            </h3>
            <p className="text-center text-sm text-muted-foreground mb-8">
              Evolución de nuestros compromisos con la sostenibilidad
            </p>
            <ESGTimeline />
          </AnimatedSection>

          {/* Impact Metrics */}
          <div className="bg-white/50 dark:bg-card/50 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto border border-green-200/50 dark:border-green-800/30">
            <AnimatedSection animation="fade-up">
              <h3 className="text-center text-xl font-normal text-foreground mb-2">
                Impacto Medible
              </h3>
              <p className="text-center text-sm text-muted-foreground mb-10">
                Resultados tangibles de nuestra estrategia ESG
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {esgMetrics.map((metric, i) => (
                <ESGMetric key={metric.label} {...metric} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-normal text-foreground mb-4">
              Conoce a Nuestro Equipo
            </h2>
            <p className="text-muted-foreground mb-8">
              Un equipo experimentado con amplia trayectoria en inversiones, operaciones y creación de valor.
            </p>
            <Link to="/team">
              <Button size="lg" className="group">
                Ver Equipo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default About;
