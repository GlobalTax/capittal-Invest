import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsSearchParams {
  searchQuery?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  author_avatar_url: string | null;
  category: string;
  tags: string[];
  read_time: number;
  is_featured: boolean;
  published_at: string;
  relevance: number;
}

export const useNewsSearch = (params: NewsSearchParams) => {
  return useQuery({
    queryKey: ["news-search", params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_news_articles", {
        search_query: params.searchQuery || null,
        filter_category: params.category || null,
        filter_tags: params.tags || null,
        limit_count: params.limit || 10,
        offset_count: params.offset || 0,
      });

      if (error) throw error;
      return data as NewsArticle[];
    },
    enabled: true,
  });
};

export const useNewsFilterOptions = () => {
  return useQuery({
    queryKey: ["news-filter-options"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_news_filter_options");
      
      if (error) throw error;
      
      const result = data && data.length > 0 ? data[0] : { categories: [], all_tags: [] };
      return result as {
        categories: string[];
        all_tags: string[];
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
