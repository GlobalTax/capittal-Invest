import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TopBarConfig {
  id: string;
  phone_number: string;
  phone_link: string;
  show_search: boolean;
  show_language_selector: boolean;
}

export interface GroupCompany {
  id: string;
  name: string;
  url: string;
  logo_url: string | null;
  is_current: boolean;
  position: number;
}

export const useTopBarConfig = () => {
  const configQuery = useQuery({
    queryKey: ["topbar-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topbar_config")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as TopBarConfig | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const companiesQuery = useQuery({
    queryKey: ["topbar-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topbar_group_companies")
        .select("*")
        .eq("is_active", true)
        .order("position");
      if (error) throw error;
      return data as GroupCompany[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    config: configQuery.data,
    companies: companiesQuery.data ?? [],
    isLoading: configQuery.isLoading || companiesQuery.isLoading,
  };
};
