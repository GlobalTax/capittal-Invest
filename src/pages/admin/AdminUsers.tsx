import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield, ShieldAlert, ShieldCheck, Edit, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

const roleIcons = {
  super_admin: ShieldAlert,
  admin: ShieldCheck,
  editor: Edit,
  viewer: Shield,
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const AdminUsers = () => {
  const { canManageUsers } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminRole>('editor');

  // Fetch admin users
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Create admin user mutation
  const createAdminMutation = useMutation({
    mutationFn: async (userData: { email: string; full_name: string; role: AdminRole }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/create-admin-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I',
          },
          body: JSON.stringify({
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            send_invite: false
          }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateDialogOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('editor');
      
      toast({
        title: 'Usuario creado',
        description: data.user.temporary_password 
          ? `Password temporal: ${data.user.temporary_password}` 
          : 'Usuario creado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AdminRole }) => {
      const { error } = await supabase.rpc('update_admin_user_role', {
        p_user_id: userId,
        p_new_role: newRole
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Rol actualizado',
        description: 'El rol del usuario ha sido actualizado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('deactivate_admin_user', {
        p_user_id: userId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuario desactivado',
        description: 'El usuario ha sido desactivado exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (!canManageUsers()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground">Solo los super administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const handleCreateUser = () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      });
      return;
    }

    createAdminMutation.mutate({
      email: newUserEmail,
      full_name: newUserName,
      role: newUserRole,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usuarios Admin</h1>
          <p className="text-muted-foreground mt-1">Gestiona los usuarios administradores del sistema</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario Admin</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario administrador. Se generará una contraseña temporal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as AdminRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer (Solo lectura)</SelectItem>
                    <SelectItem value="editor">Editor (Crear/Editar)</SelectItem>
                    <SelectItem value="admin">Admin (Publicar/Eliminar)</SelectItem>
                    <SelectItem value="super_admin">Super Admin (Todo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreateUser}
                disabled={createAdminMutation.isPending}
              >
                {createAdminMutation.isPending ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            {adminUsers?.length || 0} usuarios administradores en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers?.map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm')
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateRoleMutation.mutate({
                              userId: user.user_id,
                              newRole: value as AdminRole
                            })}
                            disabled={!user.is_active}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {user.is_active && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deactivateUserMutation.mutate(user.user_id)}
                              disabled={deactivateUserMutation.isPending}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
