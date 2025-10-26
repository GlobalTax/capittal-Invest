import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Clock } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutUntil, setLockoutUntil] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if locked out
  useEffect(() => {
    if (lockoutUntil) {
      const lockoutDate = new Date(lockoutUntil);
      const now = new Date();
      
      if (now < lockoutDate) {
        const interval = setInterval(() => {
          const currentNow = new Date();
          if (currentNow >= lockoutDate) {
            setLockoutUntil(null);
            setRemainingAttempts(null);
            clearInterval(interval);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        setLockoutUntil(null);
        setRemainingAttempts(null);
      }
    }
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validación con Zod
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: 'Acceso exitoso',
        description: 'Bienvenido al panel de administración',
      });
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Actualizar intentos restantes y lockout
      if (error.remainingAttempts !== undefined) {
        setRemainingAttempts(error.remainingAttempts);
      }
      
      if (error.lockoutUntil) {
        setLockoutUntil(error.lockoutUntil);
      }

      let errorMessage = 'Credenciales inválidas';
      
      if (error.message?.includes('Too many')) {
        errorMessage = 'Demasiados intentos fallidos. Intenta de nuevo más tarde.';
      } else if (error.message?.includes('Access denied')) {
        errorMessage = 'Acceso denegado: No eres un usuario administrador.';
      } else if (error.message?.includes('Account disabled')) {
        errorMessage = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
      }
      
      toast({
        title: 'Error de autenticación',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isLockedOut = lockoutUntil && new Date(lockoutUntil) > new Date();
  const lockoutMinutes = isLockedOut 
    ? Math.ceil((new Date(lockoutUntil!).getTime() - new Date().getTime()) / 60000)
    : 0;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Panel</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {isLockedOut && (
            <Alert variant="destructive" className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Demasiados intentos fallidos. Por favor espera {lockoutMinutes} minutos antes de intentar de nuevo.
              </AlertDescription>
            </Alert>
          )}
          
          {remainingAttempts !== null && remainingAttempts < 3 && remainingAttempts > 0 && !isLockedOut && (
            <Alert variant="default" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Te quedan {remainingAttempts} intentos antes de que tu cuenta sea bloqueada temporalmente.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                required
                disabled={isLoading || isLockedOut}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                required
                disabled={isLoading || isLockedOut}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isLockedOut}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
