import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioCompany } from "@/types/portfolio";
import { fallbackPortfolioCompanies, fallbackFilterOptions } from "@/data/fallbackData";

interface PortfolioSearchParams {
  searchQuery?: string;
  sector?: string;
  stage?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

// Sanitize search input for PostgREST filter strings
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%_(),."'\\]/g, '');
}

export const usePortfolioSearch = (params: PortfolioSearchParams) => {
  return useQuery({
    queryKey: ["portfolio-search", params],
    queryFn: async () => {
      let query = supabase
        .from('portfolio_companies')
        .select('*')
        .eq('is_active', true);

      // Apply search filter (sanitized)
      if (params.searchQuery) {
        const sanitized = sanitizeSearchTerm(params.searchQuery);
        if (sanitized) {
          query = query.or(`name.ilike.%${sanitized}%,sector.ilike.%${sanitized}%,investment_thesis.ilike.%${sanitized}%`);
        }
      }

      // Apply sector filter
      if (params.sector) {
        query = query.eq('sector', params.sector);
      }

      // Apply stage filter
      if (params.stage) {
        query = query.eq('stage', params.stage);
      }

      // Apply country filter
      if (params.country) {
        query = query.eq('country', params.country);
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
      }

      // Order by featured first, then display order
      query = query.order('is_featured', { ascending: false });
      query = query.order('display_order', { ascending: true });
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(company => ({
        ...company,
        timeline: (Array.isArray(company.timeline) ? company.timeline : []) as PortfolioCompany['timeline'],
        metrics: (company.metrics || null) as PortfolioCompany['metrics'],
      })) as PortfolioCompany[];
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds cache
    refetchOnWindowFocus: false,
    placeholderData: fallbackPortfolioCompanies,
    retry: 1,
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
    placeholderData: fallbackFilterOptions,
    retry: 1,
  });
};
