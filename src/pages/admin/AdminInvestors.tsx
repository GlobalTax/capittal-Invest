import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Plus, MoreHorizontal, Mail, Search, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AdminInvestors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    lp_id: '',
  });

  // Fetch investors
  const { data: investors, isLoading } = useQuery({
    queryKey: ['admin-investors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_users')
        .select(`
          *,
          lp:cr_lps(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch LPs for the invite form
  const { data: lps } = useQuery({
    queryKey: ['lps-for-invite'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cr_lps')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Invite investor mutation
  const inviteInvestor = useMutation({
    mutationFn: async (formData: typeof inviteForm) => {
      // Generate invitation token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // First create the investor record
      const { data: newInvestor, error } = await supabase
        .from('investor_users')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          lp_id: formData.lp_id || null,
          status: 'pending',
          invited_by: user?.id,
          invited_at: new Date().toISOString(),
          invitation_token: token,
          invitation_expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-investor-invitation', {
        body: { investor_user_id: newInvestor.id },
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't throw - the investor was created, just email failed
        toast.warning('Inversor creado, pero hubo un error al enviar el email');
      }

      return { token };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investors'] });
      toast.success('Inversor invitado correctamente');
      setIsInviteDialogOpen(false);
      setInviteForm({ email: '', full_name: '', lp_id: '' });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ya existe un inversor con ese email');
      } else {
        toast.error('Error al invitar al inversor');
      }
    },
  });

  // Resend invitation mutation
  const resendInvitation = useMutation({
    mutationFn: async (investorId: string) => {
      const { error } = await supabase.functions.invoke('send-investor-invitation', {
        body: { investor_user_id: investorId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investors'] });
      toast.success('Invitación reenviada');
    },
    onError: () => {
      toast.error('Error al reenviar la invitación');
    },
  });

  // Update investor status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('investor_users')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investors'] });
      toast.success('Estado actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    },
  });

  // Filter investors
  const filteredInvestors = investors?.filter(inv => {
    const matchesSearch = 
      inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.lp as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'active': 'default',
      'pending': 'secondary',
      'suspended': 'destructive',
    };
    const labels: Record<string, string> = {
      'active': 'Activo',
      'pending': 'Pendiente',
      'suspended': 'Suspendido',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">Gestión de Inversores</h1>
          <p className="text-muted-foreground">Administra los usuarios del portal de inversores</p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invitar Inversor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Inversor</DialogTitle>
              <DialogDescription>
                Envía una invitación por email para acceder al portal de inversores
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="inversor@empresa.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  placeholder="Juan García"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lp">LP Asociado</Label>
                <Select
                  value={inviteForm.lp_id}
                  onValueChange={(value) => setInviteForm(prev => ({ ...prev, lp_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar LP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lps?.map(lp => (
                      <SelectItem key={lp.id} value={lp.id}>
                        {lp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => inviteInvestor.mutate(inviteForm)}
                disabled={!inviteForm.email || inviteInvestor.isPending}
              >
                {inviteInvestor.isPending ? 'Enviando...' : 'Enviar Invitación'}
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
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl text-foreground">{investors?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Inversores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl text-foreground">
                  {investors?.filter(i => i.status === 'active').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl text-foreground">
                  {investors?.filter(i => i.status === 'pending').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl text-foreground">
                  {investors?.filter(i => i.status === 'suspended').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Suspendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email, nombre o LP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
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
          ) : filteredInvestors?.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg text-foreground mb-2">No hay inversores</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron inversores con los filtros aplicados'
                  : 'Invita a tu primer inversor para empezar'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inversor</TableHead>
                  <TableHead>LP</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Invitado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors?.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{investor.full_name || '-'}</p>
                        <p className="text-sm text-muted-foreground">{investor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(investor.lp as any)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(investor.status)}
                    </TableCell>
                    <TableCell>
                      {investor.last_login_at 
                        ? format(new Date(investor.last_login_at), "d MMM yyyy", { locale: es })
                        : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      {investor.invited_at 
                        ? format(new Date(investor.invited_at), "d MMM yyyy", { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {investor.status !== 'active' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus.mutate({ id: investor.id, status: 'active' })}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activar
                            </DropdownMenuItem>
                          )}
                          {investor.status !== 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => updateStatus.mutate({ id: investor.id, status: 'suspended' })}
                              className="text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          )}
                          {investor.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => resendInvitation.mutate(investor.id)}
                              disabled={resendInvitation.isPending}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar Invitación
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default AdminInvestors;
