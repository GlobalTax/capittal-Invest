import { Card } from "@/components/ui/card";
import { Overline, SectionHeader } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { getCanonicalUrl } from "@/lib/url";
import { Target, TrendingUp, Users, Zap } from "lucide-react";

const Strategy = () => {
  const levers = [
    {
      icon: Target,
      title: "Comprar y Construir",
      description:
        "Adquisiciones estratégicas para construir plataformas líderes en el mercado a través de la consolidación",
    },
    {
      icon: TrendingUp,
      title: "Aceleración del Crecimiento",
      description:
        "Escalando modelos de negocio probados a través de capital y experiencia operativa",
    },
    {
      icon: Users,
      title: "Talento y Liderazgo",
      description:
        "Construyendo equipos de primer nivel y fortaleciendo las capacidades directivas",
    },
    {
      icon: Zap,
      title: "Excelencia Operativa",
      description:
        "Implementando mejores prácticas en ventas, marketing, producto y operaciones",
    },
  ];

  return (
    <>
      <Meta
        title="Estrategia"
        description="Nuestra estrategia de inversión se centra en growth equity en tecnología, consumo, educación y servicios"
        canonicalUrl={getCanonicalUrl("/strategy")}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Nuestro Enfoque</Overline>
            <h1 className="mb-6">Estrategia de Inversión</h1>
            <p className="text-lead">
              Invertimos en empresas excepcionales en puntos de inflexión, asociándonos con
              equipos directivos para acelerar el crecimiento y construir valor duradero.
            </p>
          </div>
        </section>

        {/* Investment Thesis */}
        <section className="border-y border-border bg-neutral-100 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="mb-8">Nuestra Tesis de Inversión</h2>
              <div className="space-y-6 text-body leading-relaxed">
                <p>
                  Nos enfocamos en empresas en fase de crecimiento con modelos de negocio probados,
                  sólida economía unitaria y oportunidades de mercado significativas. Nuestro
                  tamaño de inversión típico oscila entre 25M€ y 100M€ en empresas con
                  valoraciones de 50M€ a 500M€.
                </p>
                <p>
                  Buscamos negocios con posiciones competitivas defendibles, márgenes atractivos
                  y caminos claros hacia el liderazgo del mercado. Nuestro enfoque combina
                  capital paciente con asociación activa para crear ventajas competitivas
                  sostenibles.
                </p>
                <p>
                  Creemos que los rendimientos excepcionales provienen de respaldar equipos
                  excepcionales, aplicar experiencia operativa y mantener una perspectiva
                  a largo plazo a través de los ciclos del mercado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Creation Levers */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <SectionHeader
            overline="Creación de Valor"
            title="Nuestro Enfoque para la Creación de Valor"
            description="Cuatro áreas clave que impulsan el crecimiento sostenible y el valor"
          />

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {levers.map((lever) => (
              <Card key={lever.title} className="p-8">
                <lever.icon className="h-10 w-10 text-accent mb-6" strokeWidth={1.5} />
                <h3 className="text-xl font-display mb-3">{lever.title}</h3>
                <p className="text-body leading-relaxed">{lever.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Strategy;
