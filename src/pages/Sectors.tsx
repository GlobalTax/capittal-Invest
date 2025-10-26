import { Card } from "@/components/ui/card";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { Code, ShoppingBag, GraduationCap, Briefcase } from "lucide-react";

const Sectors = () => {
  const sectors = [
    {
      icon: Code,
      name: "Technology",
      description:
        "B2B SaaS, infrastructure software, and vertical-specific platforms transforming how businesses operate",
    },
    {
      icon: ShoppingBag,
      name: "Consumer",
      description:
        "Premium brands in health, wellness, and lifestyle with strong digital presence and loyal communities",
    },
    {
      icon: GraduationCap,
      name: "Education",
      description:
        "Digital learning platforms, skills training, and education technology reshaping how people learn",
    },
    {
      icon: Briefcase,
      name: "Services",
      description:
        "Professional services businesses undergoing digital transformation and operational improvement",
    },
  ];

  return (
    <>
      <Meta
        title="Sectors"
        description="We invest across technology, consumer, education, and services sectors, focusing on companies with strong fundamentals"
        canonicalUrl={`${window.location.origin}/sectors`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Focus Areas</Overline>
            <h1 className="mb-6">Sectors We Invest In</h1>
            <p className="text-lead">
              We focus on four core sectors where we have deep expertise and proven
              track records of creating value.
            </p>
          </div>
        </section>

        {/* Sectors Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
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
