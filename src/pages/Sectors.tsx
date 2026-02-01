import { Card } from "@/components/ui/card";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { Briefcase, UtensilsCrossed, Factory } from "lucide-react";

const Sectors = () => {
  const sectors = [
    {
      icon: Briefcase,
      name: "Servicios",
      description:
        "Empresas de servicios profesionales, consultoría, outsourcing y soluciones B2B con modelos de ingresos recurrentes y potencial de escalabilidad.",
    },
    {
      icon: UtensilsCrossed,
      name: "Food & Consumer",
      description:
        "Marcas de alimentación, bebidas y productos de consumo con fuerte posicionamiento en el mercado ibérico y potencial de crecimiento internacional.",
    },
    {
      icon: Factory,
      name: "Industriales y Distribución",
      description:
        "Empresas manufactureras, de logística y distribución con operaciones eficientes y oportunidades de consolidación sectorial.",
    },
  ];

  return (
    <>
      <Meta
        title="Sectores"
        description="Invertimos en empresas de Servicios, Food & Consumer e Industriales y Distribución con fuerte potencial de crecimiento"
        canonicalUrl={`${window.location.origin}/sectors`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Áreas de Enfoque</Overline>
            <h1 className="mb-6">Sectores de Inversión</h1>
            <p className="text-lead">
              Nos especializamos en tres sectores donde contamos con profunda
              experiencia y un historial probado de creación de valor.
            </p>
          </div>
        </section>

        {/* Sectors Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
            {sectors.map((sector) => (
              <Card key={sector.name} className="p-8">
                <sector.icon className="h-10 w-10 text-accent mb-6" strokeWidth={1.5} />
                <h2 className="text-2xl font-serif mb-4">{sector.name}</h2>
                <p className="text-body leading-relaxed">{sector.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Sectors;
