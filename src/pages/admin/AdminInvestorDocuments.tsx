import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Upload, Search, Download, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIES = [
  { value: 'capital_call', label: 'Capital Call' },
  { value: 'distribution', label: 'Distribución' },
  { value: 'k1', label: 'K-1' },
  { value: 'quarterly_report', label: 'Informe Trimestral' },
  { value: 'annual_report', label: 'Informe Anual' },
  { value: 'legal', label: 'Legal' },
  { value: 'tax', label: 'Fiscal' },
  { value: 'other', label: 'Otro' },
];

const AdminInvestorDocuments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    fund_id: '',
    lp_id: '',
    quarter: '',
    year: new Date().getFullYear().toString(),
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['admin-investor-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_documents')
        .select(`
          *,
          fund:cr_funds(id, name),
          lp:cr_lps(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch funds
  const { data: funds } = useQuery({
    queryKey: ['funds-for-docs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cr_funds')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch LPs
  const { data: lps } = useQuery({
    queryKey: ['lps-for-docs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cr_lps')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Upload document
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.category || !uploadForm.fund_id) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `investor-documents/${uploadForm.fund_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadForm.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { error: insertError } = await supabase
        .from('investor_documents')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          fund_id: uploadForm.fund_id,
          lp_id: uploadForm.lp_id || null,
          quarter: uploadForm.quarter || null,
          year: uploadForm.year ? parseInt(uploadForm.year) : null,
          file_url: publicUrl,
          file_name: uploadForm.file.name,
          file_type: uploadForm.file.type,
          file_size_bytes: uploadForm.file.size,
          published_at: new Date().toISOString(),
          created_by: user?.id,
        });

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ['admin-investor-documents'] });
      toast.success('Documento subido correctamente');
      setIsUploadDialogOpen(false);
      setUploadForm({
        title: '',
        description: '',
        category: '',
        fund_id: '',
        lp_id: '',
        quarter: '',
        year: new Date().getFullYear().toString(),
        file: null,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir el documento');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investor_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investor-documents'] });
      toast.success('Documento eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el documento');
    },
  });

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.fund as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">Documentos de Inversores</h1>
          <p className="text-muted-foreground">Gestiona el Data Room del portal de inversores</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Sube un documento al Data Room de inversores
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="file">Archivo *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadForm(prev => ({ 
                    ...prev, 
                    file: e.target.files?.[0] || null 
                  }))}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Informe Trimestral Q4 2024"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fund">Fondo *</Label>
                <Select
                  value={uploadForm.fund_id}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, fund_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar fondo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {funds?.map(fund => (
                      <SelectItem key={fund.id} value={fund.id}>
                        {fund.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lp">LP Específico (opcional)</Label>
                <Select
                  value={uploadForm.lp_id}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, lp_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los LPs del fondo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los LPs del fondo</SelectItem>
                    {lps?.map(lp => (
                      <SelectItem key={lp.id} value={lp.id}>
                        {lp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Deja en blanco para que todos los LPs del fondo puedan verlo
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quarter">Trimestre</Label>
                  <Select
                    value={uploadForm.quarter}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, quarter: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin especificar</SelectItem>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max="2030"
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, year: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción opcional del documento..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={isUploading || !uploadForm.file || !uploadForm.title || !uploadForm.category || !uploadForm.fund_id}
              >
                {isUploading ? 'Subiendo...' : 'Subir Documento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl text-foreground">{documents?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {CATEGORIES.slice(0, 3).map(cat => (
          <Card key={cat.value}>
            <CardContent className="p-4">
              <div>
                <p className="text-2xl text-foreground">
                  {documents?.filter(d => d.category === cat.value).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">{cat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDocuments?.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg text-foreground mb-2">No hay documentos</h3>
              <p className="text-muted-foreground">
                Sube tu primer documento al Data Room
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fondo</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{doc.title}</p>
                        {doc.lp && (
                          <p className="text-xs text-muted-foreground">
                            Solo para: {(doc.lp as any)?.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryLabel(doc.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{(doc.fund as any)?.name || '-'}</TableCell>
                    <TableCell>
                      {doc.quarter && doc.year 
                        ? `${doc.quarter} ${doc.year}`
                        : doc.year || '-'}
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size_bytes)}</TableCell>
                    <TableCell>
                      {doc.published_at 
                        ? format(new Date(doc.published_at), "d MMM yyyy", { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('¿Eliminar este documento?')) {
                              deleteDocument.mutate(doc.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvestorDocuments;
