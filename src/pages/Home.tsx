import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { LogoGrid } from "@/components/ui/logo-grid";
import { SectionHeader, Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PortfolioDashboard } from "@/components/home/PortfolioDashboard";
import { insights, portfolioCompanies } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

const Home = () => {
  const { trackCTAClick } = useAnalytics();

  const kpis = [
    { label: "Assets Under Management", value: "$2.5B" },
    { label: "Portfolio Investments", value: "45+" },
    { label: "Successful Exits", value: "18" },
    { label: "Countries", value: "12" },
  ];

  const portfolioLogos = portfolioCompanies.slice(0, 8).map((c) => ({ name: c.name }));
  const featuredInsights = insights.slice(0, 3);

  return (
    <>
      <Meta
        title="Home"
        description="Ethos Ventures is a growth equity firm investing in exceptional companies across technology, consumer, education, and services sectors"
        keywords="venture capital, growth equity, private equity, technology investment"
        canonicalUrl={window.location.origin}
      />

      <div className="min-h-screen">
        {/* Hero Section - Editorial Two Column */}
        <section className="bg-primary text-primary-foreground py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Text */}
              <div>
                <h1 className="hero-title mb-6">
                  Investing in exceptional companies at inflection points
                </h1>
              <p className="text-lead mb-8">
                We partner with ambitious founders and management teams to build
                category-defining businesses across technology, consumer, education,
                and services.
              </p>
              <div className="flex gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  onClick={() => trackCTAClick("View Portfolio", "Hero")}
                >
                  <Link to="/portfolio">View Portfolio</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/strategy">Our Strategy</Link>
                </Button>
              </div>
            </div>
            
            {/* Right: Interactive Dashboard */}
            <div>
              <PortfolioDashboard />
            </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="border-y border-border bg-neutral-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {kpis.map((kpi) => (
                <Stat key={kpi.label} label={kpi.label} value={kpi.value} />
              ))}
            </dl>
          </div>
        </section>

        {/* Portfolio Companies */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <SectionHeader
            overline="Portfolio"
            title="Portfolio Companies"
            description="We're proud to partner with innovative companies shaping the future of their industries"
          />
          <LogoGrid logos={portfolioLogos} />
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link to="/portfolio">View All Companies</Link>
            </Button>
          </div>
        </section>

        {/* Insights Preview */}
        <section className="bg-neutral-100 py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              overline="Insights"
              title="Latest Insights"
              description="Perspectives on investing, building, and scaling exceptional businesses"
            />

            <div className="grid md:grid-cols-3 gap-8">
              {featuredInsights.map((insight) => (
                <Card key={insight.slug} className="p-6">
                  <Overline className="mb-3">{insight.category}</Overline>
                  <h3 className="text-2xl mb-3 font-serif">{insight.title}</h3>
                  <p className="text-sm text-body mb-6 leading-relaxed">
                    {insight.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-subtle mb-4 pb-4 border-b border-border">
                    <span>{insight.author}</span>
                    <span>{insight.readTime}</span>
                  </div>
                  <Link
                    to={`/insights/${insight.slug}`}
                    className="text-sm font-medium text-primary hover:text-accent inline-flex items-center transition-smooth group"
                  >
                    Read article 
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </Link>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link to="/insights">View All Insights</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
