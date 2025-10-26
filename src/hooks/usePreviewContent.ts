import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PreviewContentResponse {
  success: boolean;
  data: any;
  preview_info: {
    expires_at: string;
    accessed_count: number;
  };
}

export const usePreviewContent = (
  resourceType: 'portfolio_company' | 'news_article',
  resourceId: string,
  previewToken?: string | null
) => {
  return useQuery({
    queryKey: ['preview-content', resourceType, resourceId, previewToken],
    queryFn: async () => {
      if (!previewToken) return null;

      const { data, error } = await supabase.functions.invoke('preview-content', {
        body: {
          token: previewToken,
          type: resourceType,
          id: resourceId,
        },
      });

      if (error) throw error;
      return data as PreviewContentResponse;
    },
    enabled: !!previewToken,
    retry: false,
  });
};
