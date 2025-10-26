import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioCompany } from '@/types/portfolio';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: PortfolioCompany;
}

export const CompanyPreviewModal = ({
  open,
  onOpenChange,
  company,
}: CompanyPreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Preview: {company.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="card">Card View</TabsTrigger>
            <TabsTrigger value="detail">Detail View</TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is how the company card will appear in the portfolio grid:
            </p>
            <div className="max-w-sm mx-auto">
              <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="aspect-square bg-neutral-50 flex items-center justify-center p-8">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-neutral-300">
                      {company.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {company.sector}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {company.country}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {company.investment_thesis}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-sm font-medium text-primary">Learn more →</span>
                    {company.website_url && (
                      <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            <p className="text-sm text-muted-foreground">
              This is how the company detail page will appear:
            </p>

            {/* Hero Section */}
            <div className="pb-6 border-b">
              <div className="flex items-start gap-8 mb-6">
                {company.logo_url && (
                  <div className="w-32 h-32 bg-neutral-50 rounded-lg flex items-center justify-center p-4 flex-shrink-0">
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="mb-4 text-3xl font-bold">{company.name}</h1>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge>{company.sector}</Badge>
                    <Badge>{company.country}</Badge>
                    <Badge variant="secondary">{company.stage}</Badge>
                  </div>

                  {company.website_url && (
                    <Button variant="outline" size="sm">
                      Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Thesis */}
            {company.investment_thesis && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Investment Thesis</h2>
                <p className="text-muted-foreground">{company.investment_thesis}</p>
              </div>
            )}

            {/* Metrics */}
            {company.metrics && Object.values(company.metrics).some(v => v) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {company.metrics.revenue && (
                    <Card className="p-6 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Revenue</div>
                      <div className="text-2xl font-bold text-primary">
                        {company.metrics.revenue}
                      </div>
                    </Card>
                  )}
                  {company.metrics.employees && (
                    <Card className="p-6 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Employees</div>
                      <div className="text-2xl font-bold text-primary">
                        {company.metrics.employees}
                      </div>
                    </Card>
                  )}
                  {company.metrics.valuation && (
                    <Card className="p-6 text-center">
                      <div className="text-sm text-muted-foreground mb-2">Valuation</div>
                      <div className="text-2xl font-bold text-primary">
                        {company.metrics.valuation}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {company.timeline && company.timeline.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                <div className="relative pl-8 border-l-2 border-border space-y-6">
                  {company.timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[33px] w-3 h-3 rounded-full bg-primary" />
                      <div className="font-semibold text-primary mb-1">{item.date}</div>
                      <div className="text-muted-foreground">{item.event}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
