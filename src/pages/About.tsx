import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meta } from '@/components/seo/Meta';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Target, TrendingUp, Users, Wallet, Briefcase, GitMerge, Clock, Leaf, ArrowRight,
  LucideIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Target, TrendingUp, Users, Wallet, Briefcase, GitMerge, Clock, Leaf
};

interface AboutContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  value: string | null;
  label: string | null;
  icon: string | null;
  display_order: number;
}

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

// KPI Card component
const KPICard = ({ value, label, icon }: { value: string; label: string; icon: string | null }) => {
  const Icon = icon ? iconMap[icon] : null;
  
  return (
    <div className="text-center p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
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
  );
};

// Strategy Block component
const StrategyBlock = ({ title, subtitle, content, icon }: { 
  title: string; 
  subtitle: string; 
  content: string | null;
  icon: string | null;
}) => {
  const Icon = icon ? iconMap[icon] : Target;
  
  return (
    <Card className="p-8 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
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
  );
};

const About = () => {
  const { data: content, isLoading } = useQuery({
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
    placeholderData: (previousData) => previousData,
  });

  if (isLoading) {
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

  const hero = content?.find(c => c.section === 'hero');
  const kpis = content?.filter(c => c.section === 'kpi').sort((a, b) => a.display_order - b.display_order) || [];
  const strategies = content?.filter(c => c.section === 'strategy').sort((a, b) => a.display_order - b.display_order) || [];
  const valueCreation = content?.filter(c => c.section === 'value_creation').sort((a, b) => a.display_order - b.display_order) || [];
  const esg = content?.find(c => c.section === 'esg');

  return (
    <>
      <Meta 
        title="Sobre Nosotros"
        description="Gestora de capital privado especializada en adquisiciones estratégicas de empresas medianas con potencial de crecimiento."
        canonicalUrl="https://ethos-venture.lovable.app/about"
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground mb-6 leading-tight">
              {hero?.title || 'Creando valor a través de asociaciones estratégicas'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {hero?.subtitle || 'Somos una gestora de capital privado especializada en adquisiciones de empresas medianas con potencial de crecimiento significativo.'}
            </p>
          </div>
        </div>
      </section>

      {/* KPIs Section */}
      {kpis.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {kpis.map((kpi) => (
                <KPICard 
                  key={kpi.id}
                  value={kpi.value || '0'}
                  label={kpi.label || ''}
                  icon={kpi.icon}
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
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">
                Nuestra Estrategia de Inversión
              </h2>
              <p className="text-muted-foreground text-lg">
                Nos asociamos con empresarios y equipos directivos para acelerar el crecimiento y crear valor sostenible.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {strategies.map((strategy) => (
                <StrategyBlock
                  key={strategy.id}
                  title={strategy.title || ''}
                  subtitle={strategy.subtitle || ''}
                  content={strategy.content}
                  icon={strategy.icon}
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
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-normal mb-4">
                Nuestro Impacto
              </h2>
              <p className="text-background/70 text-lg">
                Resultados medios en nuestras participadas durante el periodo de inversión.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {valueCreation.map((metric) => (
                <div key={metric.id} className="text-center">
                  <AnimatedValue 
                    value={metric.value || '0'} 
                    className="block text-4xl md:text-5xl font-normal text-background mb-2"
                  />
                  <p className="font-normal text-background mb-1">{metric.label}</p>
                  {metric.content && (
                    <p className="text-sm text-background/60">{metric.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ESG Section */}
      {esg && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-normal text-foreground mb-4">{esg.title}</h2>
                  <p className="text-lg text-muted-foreground mb-4">{esg.subtitle}</p>
                  <p className="text-muted-foreground">{esg.content}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
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
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
