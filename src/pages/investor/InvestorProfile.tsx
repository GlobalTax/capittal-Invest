import { useState } from 'react';
import { useInvestorAuth } from '@/hooks/useInvestorAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InvestorProfile = () => {
  const { investorUser, refreshInvestorUser } = useInvestorAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: investorUser?.full_name || '',
    phone: investorUser?.phone || '',
  });

  const handleSave = async () => {
    if (!investorUser) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('investor_users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', investorUser.id);

      if (error) throw error;

      await refreshInvestorUser();
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: investorUser?.full_name || '',
      phone: investorUser?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Tus datos de contacto en el portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              value={investorUser?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              El email no puede ser modificado. Contacta con tu gestor si necesitas cambiarlo.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre Completo
            </Label>
            {isEditing ? (
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            ) : (
              <Input
                id="full_name"
                value={investorUser?.full_name || '-'}
                disabled
                className="bg-muted"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+34 600 000 000"
              />
            ) : (
              <Input
                id="phone"
                value={investorUser?.phone || '-'}
                disabled
                className="bg-muted"
              />
            )}
          </div>

          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Información de la Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estado de la cuenta</p>
              <p className="text-foreground capitalize">
                {investorUser?.status === 'active' ? 'Activa' : investorUser?.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Último acceso</p>
              <p className="text-foreground">
                {investorUser?.last_login_at 
                  ? format(new Date(investorUser.last_login_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña de acceso al portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(
                  investorUser?.email || '',
                  { redirectTo: `${window.location.origin}/investor/reset-password` }
                );
                if (error) throw error;
                toast.success('Te hemos enviado un email para restablecer tu contraseña');
              } catch (error) {
                toast.error('Error al enviar el email de restablecimiento');
              }
            }}
          >
            Enviar email de restablecimiento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestorProfile;
