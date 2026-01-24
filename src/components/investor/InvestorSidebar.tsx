import { Link, useLocation } from 'react-router-dom';
import { useInvestorAuth } from '@/hooks/useInvestorAuth';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  User,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/investor', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/investor/funds', icon: Briefcase, label: 'Mis Fondos' },
  { path: '/investor/documents', icon: FileText, label: 'Documentos' },
  { path: '/investor/performance', icon: TrendingUp, label: 'Performance' },
];

export const InvestorSidebar = () => {
  const location = useLocation();
  const { investorUser, signOut } = useInvestorAuth();

  const isActive = (path: string) => {
    if (path === '/investor') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <Link to="/investor" className="block">
          <h1 className="text-xl">Portal del Inversor</h1>
          <p className="text-slate-400 text-sm mt-1">Ethos Venture</p>
        </Link>
      </div>

      <Separator className="bg-slate-700" />

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive(item.path)
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}

        <Separator className="bg-slate-700 my-4" />

        <Link to="/investor/notifications">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              isActive('/investor/notifications')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="mr-3 h-4 w-4" />
            Notificaciones
          </Button>
        </Link>

        <Link to="/investor/profile">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              isActive('/investor/profile')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="mr-3 h-4 w-4" />
            Mi Perfil
          </Button>
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-700">
        {investorUser && (
          <div className="mb-4">
            <p className="text-sm text-white truncate">{investorUser.full_name || 'Inversor'}</p>
            <p className="text-xs text-slate-400 truncate">{investorUser.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};
