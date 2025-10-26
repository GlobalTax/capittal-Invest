import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GeneratePreviewParams {
  resourceType: 'portfolio_company' | 'news_article';
  resourceId: string;
  expiresHours?: number;
}

interface PreviewTokenResult {
  token: string;
  preview_url: string;
  expires_at: string;
}

export const useGeneratePreview = () => {
  return useMutation({
    mutationFn: async ({ 
      resourceType, 
      resourceId, 
      expiresHours = 168 
    }: GeneratePreviewParams) => {
      // @ts-ignore - RPC function not yet in generated types
      const { data, error } = await supabase.rpc('generate_preview_token', {
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_expires_hours: expiresHours,
      });

      if (error) throw error;
      return data[0] as PreviewTokenResult;
    },
  });
};
