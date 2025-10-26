import { Card } from "@/components/ui/card";
import { Overline, SectionHeader } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { Target, TrendingUp, Users, Zap } from "lucide-react";

const Strategy = () => {
  const levers = [
    {
      icon: Target,
      title: "Buy-and-Build",
      description:
        "Strategic acquisitions to build market-leading platforms through consolidation",
    },
    {
      icon: TrendingUp,
      title: "Growth Acceleration",
      description:
        "Scaling proven business models through capital and operational expertise",
    },
    {
      icon: Users,
      title: "Talent & Leadership",
      description:
        "Building world-class teams and strengthening management capabilities",
    },
    {
      icon: Zap,
      title: "Operational Playbooks",
      description:
        "Implementing best practices across sales, marketing, product, and operations",
    },
  ];

  return (
    <>
      <Meta
        title="Strategy"
        description="Our investment strategy focuses on growth equity in technology, consumer, education, and services sectors"
        canonicalUrl={`${window.location.origin}/strategy`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Our Approach</Overline>
            <h1 className="mb-6">Investment Strategy</h1>
            <p className="text-lead">
              We invest in exceptional companies at inflection points, partnering with
              management teams to accelerate growth and build enduring value.
            </p>
          </div>
        </section>

        {/* Investment Thesis */}
        <section className="border-y border-border bg-neutral-100 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="mb-8">Our Investment Thesis</h2>
              <div className="space-y-6 text-body leading-relaxed">
                <p>
                  We focus on growth-stage companies with proven business models,
                  strong unit economics, and significant market opportunities. Our
                  typical investment size ranges from $25M to $100M in equity value
                  from $50M to $500M.
                </p>
                <p>
                  We seek businesses with defensible competitive positions, attractive
                  margins, and clear paths to market leadership. Our approach combines
                  patient capital with active partnership to create sustainable
                  competitive advantages.
                </p>
                <p>
                  We believe exceptional returns come from backing exceptional teams,
                  applying operational expertise, and maintaining a long-term
                  perspective through market cycles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Creation Levers */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <SectionHeader
            overline="Value Creation"
            title="Our Approach to Value Creation"
            description="Four key areas that drive sustainable growth and value"
          />

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {levers.map((lever) => (
              <Card key={lever.title} className="p-8">
                <lever.icon className="h-10 w-10 text-accent mb-6" strokeWidth={1.5} />
                <h3 className="text-xl font-serif mb-3">{lever.title}</h3>
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
