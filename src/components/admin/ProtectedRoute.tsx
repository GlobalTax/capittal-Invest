import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth, AdminRole } from '@/contexts/UnifiedAuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AdminRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isProfileLoading, profileChecked, isAdmin, hasAdminRole } = useUnifiedAuth();

  console.log('[PROTECTED DEBUG] ProtectedRoute evaluating:', {
    user: !!user,
    userEmail: user?.email,
    isLoading,
    isProfileLoading,
    profileChecked,
    isAdmin
  });

  // Show loading while auth state is being determined
  if (isLoading || isProfileLoading || (user && !profileChecked)) {
    console.log('[PROTECTED DEBUG] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED DEBUG] No user - redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    console.log('[PROTECTED DEBUG] User is not admin - showing access denied');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder al panel de administración.</p>
      </div>
    );
  }

  if (requiredRole && !hasAdminRole(requiredRole)) {
    console.log('[PROTECTED DEBUG] Insufficient role');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">Permisos Insuficientes</h1>
        <p className="text-muted-foreground">No tienes el rol requerido para acceder a esta sección.</p>
      </div>
    );
  }

  console.log('[PROTECTED DEBUG] Access granted - rendering children');
  return <>{children}</>;
};
