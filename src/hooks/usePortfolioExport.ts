import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV, exportToExcel, preparePortfolioData } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ExportFilters {
  searchQuery?: string;
  sector?: string;
  stage?: string;
  country?: string;
}

export const usePortfolioExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const exportData = async (filters: ExportFilters, format: 'csv' | 'excel') => {
    setIsExporting(true);
    
    try {
      const { data, error } = await supabase.rpc('search_portfolio_companies', {
        search_query: filters.searchQuery || null,
        filter_sector: filters.sector || null,
        filter_stage: filters.stage || null,
        filter_country: filters.country || null,
        limit_count: 1000,
        offset_count: 0,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'No data to export',
          description: 'No companies match the current filters.',
          variant: 'destructive',
        });
        return;
      }

      const preparedData = preparePortfolioData(data);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `portfolio-export-${timestamp}.${format === 'csv' ? 'csv' : 'xlsx'}`;

      if (format === 'csv') {
        exportToCSV(preparedData, filename);
      } else {
        exportToExcel(preparedData, filename);
      }

      toast({
        title: 'Export successful',
        description: `${data.length} companies exported as ${format.toUpperCase()}.`,
      });

      // Track analytics
      trackEvent('portfolio_export', {
        format,
        result_count: data.length,
        filtered: !!(filters.searchQuery || filters.sector || filters.stage || filters.country),
        filters: {
          search: !!filters.searchQuery,
          sector: filters.sector || null,
          stage: filters.stage || null,
          country: filters.country || null,
        },
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
};
