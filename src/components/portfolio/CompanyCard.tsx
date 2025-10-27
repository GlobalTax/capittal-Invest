import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioCompany } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface CompanyCardProps {
  company: PortfolioCompany;
  variant?: 'grid' | 'list';
}

export const CompanyCard = ({ company, variant = 'grid' }: CompanyCardProps) => {
  if (variant === 'list') {
    return (
      <Card className="p-6 hover:shadow-lg transition-smooth">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="max-w-full max-h-full object-contain p-2"
              />
            ) : (
              <div className="text-2xl font-medium text-muted-foreground">
                {company.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-medium mb-2">{company.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{company.sector}</Badge>
                  <Badge variant="outline">{company.country}</Badge>
                  <Badge variant="secondary">{company.stage}</Badge>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Link to={`/portfolio/${company.slug}`}>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </Link>
                {company.website_url && (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {company.investment_thesis || company.description}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden hover-lift hover:shadow-2xl transition-all duration-300">
      <div className="aspect-square bg-muted flex items-center justify-center p-8">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-4xl font-medium text-muted-foreground">
            {company.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-medium mb-2 group-hover:text-primary transition-colors">
            {company.name}
          </h3>
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
          {company.investment_thesis || company.description}
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link
            to={`/portfolio/${company.slug}`}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-smooth"
          >
            Learn more →
          </Link>
          {company.website_url && (
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};
