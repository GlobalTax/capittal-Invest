import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { PreviewBanner } from "@/components/ui/preview-banner";
import { usePreviewContent } from "@/hooks/usePreviewContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { portfolioCompanies } from "@/data/mockData";

const PortfolioDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('preview');

  // Try preview mode first if token exists
  const { data: previewData, isLoading: isPreviewLoading, error: previewError } = usePreviewContent(
    'portfolio_company',
    id || '',
    previewToken
  );

  // Fetch from database for published content
  const { data: dbData, isLoading: isDbLoading } = useQuery({
    queryKey: ['portfolio-company', id],
    queryFn: async () => {
      if (!id) return null;
      // @ts-ignore - Avoid deep type instantiation
      const response = await supabase
        .from('portfolio_companies')
        .select('id, name, slug, description, logo_url, website_url, sector, stage, country, founded_year, investment_date, investment_thesis, metrics, timeline, is_featured, created_at')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !previewToken && !!id,
  });

  // Determine which data source to use
  const isLoading = previewToken ? isPreviewLoading : isDbLoading;
  const dbCompany: any = previewToken ? previewData?.data : dbData;
  const mockCompany = portfolioCompanies.find(c => c.id === id);
  const company = dbCompany || mockCompany;
  const isPreviewMode = !!previewToken && !!previewData;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Preview Not Available</h1>
          <p className="text-muted-foreground mb-8">
            The preview token is invalid or has expired.
          </p>
          <Button asChild>
            <Link to="/portfolio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
      {isPreviewMode && previewData?.preview_info && (
        <PreviewBanner 
          expiresAt={previewData.preview_info.expires_at}
          accessedCount={previewData.preview_info.accessed_count}
        />
      )}
      <Meta 
        title={company.name}
        description={company.description || company.investment_thesis || ''}
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
            <div className="mb-12 pb-12 border-b border-border">
              <div className="flex items-start gap-8 mb-8">
                {/* Logo */}
                {company.logo_url && (
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center p-4 flex-shrink-0">
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="mb-4 text-4xl">{company.name}</h1>
                  <div className="flex gap-2 mb-6 flex-wrap">
                    <Badge>{company.sector}</Badge>
                    <Badge>{company.country}</Badge>
                    <Badge variant="secondary">{company.stage}</Badge>
                  </div>

                  {company.website_url && (
                    <a
                      href={company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline">
                        Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Thesis */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl mb-4">Investment Thesis</h2>
              <p className="text-body">{company.investment_thesis || company.description}</p>
            </Card>

            {/* Key Metrics */}
            {company.metrics && Object.values(company.metrics).some(v => v) && (
              <Card className="p-8 mb-8">
                <h2 className="text-2xl mb-6">Key Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {company.metrics.revenue && (
                    <Card className="p-6 text-center bg-muted">
                      <div className="text-sm text-muted-foreground mb-2">Revenue</div>
                      <div className="text-3xl font-bold text-primary">
                        {company.metrics.revenue}
                      </div>
                    </Card>
                  )}
                  {company.metrics.employees && (
                    <Card className="p-6 text-center bg-muted">
                      <div className="text-sm text-muted-foreground mb-2">Employees</div>
                      <div className="text-3xl font-bold text-primary">
                        {company.metrics.employees}
                      </div>
                    </Card>
                  )}
                  {company.metrics.valuation && (
                    <Card className="p-6 text-center bg-muted">
                      <div className="text-sm text-muted-foreground mb-2">Valuation</div>
                      <div className="text-3xl font-bold text-primary">
                        {company.metrics.valuation}
                      </div>
                    </Card>
                  )}
                </div>
              </Card>
            )}

            {/* Timeline */}
            {company.timeline && Array.isArray(company.timeline) && company.timeline.length > 0 && (
              <Card className="p-8">
                <h2 className="text-2xl mb-6">Timeline</h2>
                <div className="relative pl-8 border-l-2 border-border space-y-6">
                  {company.timeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[33px] w-3 h-3 rounded-full bg-primary" />
                      <div className="font-semibold text-primary mb-1">
                        {item.date}
                      </div>
                      <div className="text-muted-foreground">{item.event}</div>
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
