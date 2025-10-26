export interface PortfolioCompany {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  sector: string;
  stage: string;
  country: string;
  founded_year: number | null;
  investment_date: string | null;
  investment_thesis: string | null;
  metrics: {
    revenue?: string;
    employees?: string;
    valuation?: string;
  } | null;
  timeline: Array<{
    date: string;
    event: string;
  }>;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyFormData {
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  website_url: string;
  sector: string;
  stage: string;
  country: string;
  founded_year: number | null;
  investment_date: string | null;
  investment_thesis: string;
  metrics: {
    revenue: string;
    employees: string;
    valuation: string;
  };
  timeline: Array<{
    date: string;
    event: string;
  }>;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}
