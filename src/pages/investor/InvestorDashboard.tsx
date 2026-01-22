import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInvestorAuth } from '@/contexts/InvestorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  Download,
  DollarSign,
  Percent,
  PiggyBank,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InvestorDashboard = () => {
  const { investorUser } = useInvestorAuth();

  // Fetch investor positions (funds they're invested in)
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['investor-positions', investorUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_positions')
        .select(`
          *,
          fund:cr_funds(id, name, type, status, vintage)
        `)
        .eq('investor_user_id', investorUser!.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!investorUser?.id,
  });

  // Fetch recent documents
  const { data: recentDocs, isLoading: docsLoading } = useQuery({
    queryKey: ['investor-recent-docs', investorUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_documents')
        .select(`
          *,
          fund:cr_funds(name)
        `)
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!investorUser?.id,
  });

  // Fetch unread notifications count
  const { data: notifications } = useQuery({
    queryKey: ['investor-notifications-preview', investorUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_notifications')
        .select('*')
        .eq('investor_user_id', investorUser!.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!investorUser?.id,
  });

  // Calculate totals from positions
  const totals = positions?.reduce(
    (acc, pos) => ({
      committed: acc.committed + (Number(pos.committed_capital) || 0),
      called: acc.called + (Number(pos.called_capital) || 0),
      distributed: acc.distributed + (Number(pos.distributed_capital) || 0),
      nav: acc.nav + (Number(pos.current_nav) || 0),
    }),
    { committed: 0, called: 0, distributed: 0, nav: 0 }
  ) || { committed: 0, called: 0, distributed: 0, nav: 0 };

  const tvpi = totals.called > 0 
    ? ((totals.distributed + totals.nav) / totals.called).toFixed(2)
    : '0.00';

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'capital_call': 'Capital Call',
      'distribution': 'Distribución',
      'k1': 'K-1',
      'quarterly_report': 'Informe Trimestral',
      'annual_report': 'Informe Anual',
      'legal': 'Legal',
      'tax': 'Fiscal',
      'other': 'Otro',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tus inversiones</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comprometido</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl text-foreground">{formatCurrency(totals.committed)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Llamado</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl text-foreground">{formatCurrency(totals.called)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distribuido</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl text-foreground">{formatCurrency(totals.distributed)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TVPI</p>
                {positionsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl text-foreground">{tvpi}x</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Mis Fondos
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/investor/funds">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {positionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : positions?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tienes fondos asignados
              </p>
            ) : (
              <div className="space-y-3">
                {positions?.slice(0, 3).map((position) => (
                  <Link
                    key={position.id}
                    to={`/investor/funds/${position.fund_id}`}
                    className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">{(position.fund as any)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(Number(position.committed_capital))} comprometido
                        </p>
                      </div>
                      <Badge variant={(position.fund as any)?.status === 'active' ? 'default' : 'secondary'}>
                        {(position.fund as any)?.status === 'active' ? 'Activo' : (position.fund as any)?.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Recientes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/investor/documents">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentDocs?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay documentos disponibles
              </p>
            ) : (
              <div className="space-y-2">
                {recentDocs?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryLabel(doc.category)} • {(doc.fund as any)?.name}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications Preview */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-foreground">{notif.title}</p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notif.created_at), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestorDashboard;
