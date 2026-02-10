import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Eye, Trash2, Search } from 'lucide-react';
import { CompanyFormDialog } from '@/components/admin/portfolio/CompanyFormDialog';
import { CompanyPreviewModal } from '@/components/admin/portfolio/CompanyPreviewModal';
import { PortfolioCompany } from '@/types/portfolio';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const AdminPortfolio = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<PortfolioCompany | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['admin-portfolio', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('portfolio_companies')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sector.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(company => ({
        ...company,
        timeline: (Array.isArray(company.timeline) ? company.timeline : []) as PortfolioCompany['timeline'],
      })) as PortfolioCompany[];
    },
  });

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_companies')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: `Empresa ${!currentStatus ? 'activada' : 'desactivada'} correctamente`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_companies')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Estado destacado actualizado',
        description: `Empresa ${!currentStatus ? 'destacada' : 'sin destacar'} correctamente`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      const { error } = await supabase
        .from('portfolio_companies')
        .delete()
        .eq('id', companyToDelete);

      if (error) throw error;

      toast({
        title: 'Empresa eliminada',
        description: 'La empresa ha sido eliminada correctamente',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCompanyToDelete(null);
    }
  };

  const handleEdit = (company: PortfolioCompany) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handlePreview = (company: PortfolioCompany) => {
    setSelectedCompany(company);
    setIsPreviewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCompany(undefined);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empresas del Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las empresas del portfolio y su visibilidad pública
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Empresa
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Destacada</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No se encontraron empresas. Haz clic en "Añadir Empresa" para crear una.
                </TableCell>
              </TableRow>
            ) : (
              companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="max-w-full max-h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {company.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{company.sector}</Badge>
                  </TableCell>
                  <TableCell>{company.country}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{company.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={company.is_featured}
                      onCheckedChange={() => toggleFeatured(company.id, company.is_featured)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={company.is_active}
                      onCheckedChange={() => toggleActive(company.id, company.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(company)}
                        title="Vista previa"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompanyToDelete(company.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CompanyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        company={selectedCompany}
        onSuccess={() => {
          refetch();
          setSelectedCompany(undefined);
        }}
      />

      {selectedCompany && (
        <CompanyPreviewModal
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          company={selectedCompany}
        />
      )}

      <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la empresa
              de tu portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
