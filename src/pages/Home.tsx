import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { LogoGrid } from "@/components/ui/logo-grid";
import { Meta } from "@/components/seo/Meta";
import { useAnalytics } from "@/hooks/useAnalytics";
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
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl">
            <h1 className="mb-6">
              Investing in exceptional companies at inflection points
            </h1>
            <p className="text-xl text-body mb-8 max-w-2xl">
              We partner with ambitious founders and management teams to build
              category-defining businesses across technology, consumer, education,
              and services.
            </p>
            <Button
              asChild
              size="lg"
              onClick={() => trackCTAClick("View Portfolio", "Hero")}
            >
              <Link to="/portfolio">
                View Our Portfolio <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* KPIs */}
        <section className="border-y border-border bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {kpis.map((kpi) => (
                <Stat key={kpi.label} label={kpi.label} value={kpi.value} />
              ))}
            </dl>
          </div>
        </section>

        {/* Portfolio Companies */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="mb-4">Portfolio Companies</h2>
            <p className="text-body max-w-2xl mx-auto">
              We're proud to partner with innovative companies shaping the future
              of their industries
            </p>
          </div>
          <LogoGrid logos={portfolioLogos} />
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link to="/portfolio">View All Companies</Link>
            </Button>
          </div>
        </section>

        {/* Insights Preview */}
        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="mb-4">Latest Insights</h2>
              <p className="text-body max-w-2xl">
                Perspectives on investing, building, and scaling exceptional businesses
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredInsights.map((insight) => (
                <Card key={insight.slug} className="p-6 hover:shadow-lg transition-smooth">
                  <div className="flex flex-col h-full">
                    <div className="text-xs font-medium text-accent mb-2">
                      {insight.category}
                    </div>
                    <h3 className="text-xl mb-2">{insight.title}</h3>
                    <p className="text-sm text-body mb-4 flex-grow">
                      {insight.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-subtle">
                      <span>{insight.author}</span>
                      <span>{insight.readTime}</span>
                    </div>
                    <Link
                      to={`/insights/${insight.slug}`}
                      className="text-sm font-medium text-primary hover:text-accent mt-4 inline-flex items-center transition-smooth"
                    >
                      Read more <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline">
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
