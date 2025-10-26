import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Meta } from "@/components/seo/Meta";
import { portfolioCompanies } from "@/data/mockData";
import { ExternalLink, ArrowLeft } from "lucide-react";

const PortfolioDetail = () => {
  const { id } = useParams();
  const company = portfolioCompanies.find((c) => c.id === id);

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4">Company not found</h1>
          <Button asChild>
            <Link to="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Meta
        title={company.name}
        description={company.thesis}
        canonicalUrl={`${window.location.origin}/portfolio/${company.id}`}
      />

      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/portfolio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>

          <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="mb-4">{company.name}</h1>
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-secondary rounded text-sm">
                      {company.sector}
                    </span>
                    <span className="px-3 py-1 bg-secondary rounded text-sm">
                      {company.country}
                    </span>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded text-sm">
                      {company.stage}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-smooth"
              >
                Visit website <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Investment Thesis */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl mb-4">Investment Thesis</h2>
              <p className="text-body">{company.thesis}</p>
            </Card>

            {/* Key Metrics */}
            {company.metrics && (
              <Card className="p-8 mb-8">
                <h2 className="text-2xl mb-6">Key Metrics</h2>
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {company.metrics.revenue && (
                    <div>
                      <dt className="text-sm text-subtle mb-1">Revenue</dt>
                      <dd className="text-2xl font-semibold">{company.metrics.revenue}</dd>
                    </div>
                  )}
                  {company.metrics.employees && (
                    <div>
                      <dt className="text-sm text-subtle mb-1">Employees</dt>
                      <dd className="text-2xl font-semibold">{company.metrics.employees}</dd>
                    </div>
                  )}
                  {company.metrics.valuation && (
                    <div>
                      <dt className="text-sm text-subtle mb-1">Valuation</dt>
                      <dd className="text-2xl font-semibold">{company.metrics.valuation}</dd>
                    </div>
                  )}
                </dl>
              </Card>
            )}

            {/* Timeline */}
            {company.timeline && (
              <Card className="p-8">
                <h2 className="text-2xl mb-6">Timeline</h2>
                <div className="space-y-4">
                  {company.timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="font-semibold text-primary min-w-[60px]">
                        {item.date}
                      </div>
                      <div className="text-body">{item.event}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioDetail;
