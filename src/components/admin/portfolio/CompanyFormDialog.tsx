import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompanyForm } from './CompanyForm';
import { CompanyFormData, PortfolioCompany } from '@/types/portfolio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { uploadCompanyLogo, replaceCompanyLogo } from '@/lib/uploadCompanyLogo';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: PortfolioCompany;
  onSuccess: () => void;
}

export const CompanyFormDialog = ({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CompanyFormData, logoFile: File | null) => {
    setIsLoading(true);
    try {
      let logoUrl = data.logo_url;

      // Handle logo upload
      if (logoFile) {
        if (company?.logo_url) {
          logoUrl = await replaceCompanyLogo(company.logo_url, logoFile, data.slug);
        } else {
          logoUrl = await uploadCompanyLogo(logoFile, data.slug);
        }
      }

      const companyData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logo_url: logoUrl,
        website_url: data.website_url || null,
        sector: data.sector,
        stage: data.stage,
        country: data.country,
        founded_year: data.founded_year,
        investment_date: data.investment_date,
        investment_thesis: data.investment_thesis,
        metrics: data.metrics || null,
        timeline: data.timeline || [],
        is_active: data.is_active,
        is_featured: data.is_featured,
        display_order: data.display_order,
      };

      if (company) {
        // Update existing company
        const { error } = await supabase
          .from('portfolio_companies')
          .update(companyData)
          .eq('id', company.id);

        if (error) throw error;

        toast({
          title: 'Company updated',
          description: 'The company has been updated successfully.',
        });
      } else {
        // Create new company
        const { error } = await supabase
          .from('portfolio_companies')
          .insert(companyData);

        if (error) throw error;

        toast({
          title: 'Company created',
          description: 'The company has been created successfully.',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Edit Company' : 'Add New Company'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)] pr-4">
          <CompanyForm
            initialData={company ? {
              ...company,
              metrics: {
                revenue: company.metrics?.revenue || '',
                employees: company.metrics?.employees || '',
                valuation: company.metrics?.valuation || '',
              }
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
