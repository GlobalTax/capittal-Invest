import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useInvestorAuth } from '@/contexts/InvestorAuthContext';

interface ProtectedInvestorRouteProps {
  children: ReactNode;
}

export const ProtectedInvestorRoute = ({ children }: ProtectedInvestorRouteProps) => {
  const { user, investorUser, isLoading, isInvestor } = useInvestorAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/investor/login" replace />;
  }

  if (!isInvestor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <h1 className="text-2xl text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground">
          {investorUser?.status === 'pending' 
            ? 'Tu cuenta está pendiente de activación.'
            : investorUser?.status === 'suspended'
            ? 'Tu cuenta ha sido suspendida.'
            : 'No tienes acceso al portal de inversores.'}
        </p>
        <a href="/investor/login" className="text-primary hover:underline">
          Volver al login
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
