import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioSearchParams {
  searchQuery?: string;
  sector?: string;
  stage?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

interface PortfolioCompany {
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
  metrics: Record<string, any>;
  timeline: Array<any>;
  is_featured: boolean;
  relevance: number;
}

export const usePortfolioSearch = (params: PortfolioSearchParams) => {
  return useQuery({
    queryKey: ["portfolio-search", params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_portfolio_companies", {
        search_query: params.searchQuery || null,
        filter_sector: params.sector || null,
        filter_stage: params.stage || null,
        filter_country: params.country || null,
        limit_count: params.limit || 20,
        offset_count: params.offset || 0,
      });

      if (error) throw error;
      return data as PortfolioCompany[];
    },
    enabled: true,
  });
};

export const usePortfolioFilterOptions = () => {
  return useQuery({
    queryKey: ["portfolio-filter-options"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_portfolio_filter_options");
      
      if (error) throw error;
      
      const result = data && data.length > 0 ? data[0] : { sectors: [], stages: [], countries: [] };
      return result as {
        sectors: string[];
        stages: string[];
        countries: string[];
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
