import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInvestorAuth } from '@/hooks/useInvestorAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'capital_call', label: 'Capital Calls' },
  { value: 'distribution', label: 'Distribuciones' },
  { value: 'k1', label: 'K-1' },
  { value: 'quarterly_report', label: 'Informes Trimestrales' },
  { value: 'annual_report', label: 'Informes Anuales' },
  { value: 'legal', label: 'Legal' },
  { value: 'tax', label: 'Fiscal' },
  { value: 'other', label: 'Otros' },
];

const InvestorDocuments = () => {
  const { investorUser } = useInvestorAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['investor-documents', investorUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_documents')
        .select(`
          *,
          fund:cr_funds(name)
        `)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!investorUser?.id,
  });

  // Log document access
  const logAccess = useMutation({
    mutationFn: async ({ documentId, action }: { documentId: string; action: 'view' | 'download' }) => {
      const { error } = await supabase
        .from('investor_document_access')
        .insert({
          document_id: documentId,
          investor_user_id: investorUser!.id,
          action,
        });
      
      if (error) throw error;
    },
  });

  // Get unique years from documents
  const years = [...new Set(documents?.map(d => d.year).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.fund as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || doc.year?.toString() === selectedYear;
    
    return matchesSearch && matchesCategory && matchesYear;
  });

  const getCategoryLabel = (category: string) => {
    const found = CATEGORIES.find(c => c.value === category);
    return found?.label || category;
  };

  const getCategoryVariant = (category: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'capital_call': 'destructive',
      'distribution': 'default',
      'quarterly_report': 'secondary',
      'annual_report': 'secondary',
      'k1': 'outline',
      'tax': 'outline',
      'legal': 'outline',
    };
    return variants[category] || 'secondary';
  };

  const handleDownload = async (doc: any) => {
    logAccess.mutate({ documentId: doc.id, action: 'download' });
    window.open(doc.file_url, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-foreground">Documentos</h1>
        <p className="text-muted-foreground">Data Room - Accede a todos tus documentos</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year?.toString() || ''}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredDocuments?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg text-foreground mb-2">No hay documentos</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' || selectedYear !== 'all'
                ? 'No se encontraron documentos con los filtros aplicados'
                : 'Aún no hay documentos disponibles'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocuments?.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 bg-muted rounded-lg shrink-0">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-foreground truncate">{doc.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={getCategoryVariant(doc.category)}>
                          {getCategoryLabel(doc.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {(doc.fund as any)?.name}
                        </span>
                        {doc.quarter && (
                          <span className="text-xs text-muted-foreground">
                            • {doc.quarter}
                          </span>
                        )}
                        {doc.file_size_bytes && (
                          <span className="text-xs text-muted-foreground">
                            • {formatFileSize(doc.file_size_bytes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {doc.published_at && format(new Date(doc.published_at), "d MMM yyyy", { locale: es })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
                
                {doc.description && (
                  <p className="text-sm text-muted-foreground mt-3 pl-14">
                    {doc.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Count */}
      {filteredDocuments && filteredDocuments.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Mostrando {filteredDocuments.length} de {documents?.length} documentos
        </p>
      )}
    </div>
  );
};

export default InvestorDocuments;
