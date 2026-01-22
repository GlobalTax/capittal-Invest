import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const InvestorAcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'used'>('loading');
  const [investor, setInvestor] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      const { data, error } = await supabase
        .from('investor_users')
        .select('*')
        .eq('invitation_token', token)
        .maybeSingle();

      if (error || !data) {
        setStatus('invalid');
        return;
      }

      if (data.user_id) {
        setStatus('used');
        return;
      }

      if (new Date(data.invitation_expires_at) < new Date()) {
        setStatus('expired');
        return;
      }

      setInvestor(data);
      setStatus('valid');
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: investor.email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // Update the investor_users record
      const { error: updateError } = await supabase
        .from('investor_users')
        .update({
          user_id: authData.user.id,
          status: 'active',
          invitation_token: null,
          invitation_expires_at: null,
        })
        .eq('id', investor.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Cuenta activada correctamente. Por favor, inicia sesión.');
      navigate('/investor/login');
    } catch (error: any) {
      console.error('Error activating account:', error);
      toast.error(error.message || 'Error al activar la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-400">Verificando invitación...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl text-white mb-2">Enlace Inválido</h2>
            <p className="text-slate-400 mb-6">
              El enlace de invitación no es válido. Por favor, contacta con tu gestor para obtener una nueva invitación.
            </p>
            <Button variant="outline" onClick={() => navigate('/investor/login')}>
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl text-white mb-2">Invitación Expirada</h2>
            <p className="text-slate-400 mb-6">
              Esta invitación ha expirado. Por favor, solicita una nueva invitación a tu gestor.
            </p>
            <Button variant="outline" onClick={() => navigate('/investor/login')}>
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'used') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl text-white mb-2">Cuenta Ya Activada</h2>
            <p className="text-slate-400 mb-6">
              Esta invitación ya ha sido utilizada. Si ya tienes una cuenta, puedes iniciar sesión.
            </p>
            <Button onClick={() => navigate('/investor/login')}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-white mb-2">Activa tu Cuenta</h1>
          <p className="text-slate-400">Portal del Inversor - Ethos Venture</p>
        </div>

        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Crear Contraseña</CardTitle>
            <CardDescription className="text-slate-400">
              Configura tu contraseña para acceder al portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4" />
                <span>{investor?.email}</span>
              </div>
              {investor?.full_name && (
                <p className="text-sm text-slate-400 mt-1">{investor.full_name}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Activando...
                  </>
                ) : (
                  'Activar Cuenta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestorAcceptInvitation;
