import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInvestorAuth } from '@/hooks/useInvestorAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InvestorFunds = () => {
  const { investorUser } = useInvestorAuth();

  const { data: positions, isLoading } = useQuery({
    queryKey: ['investor-positions-full', investorUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_positions')
        .select(`
          *,
          fund:cr_funds(id, name, type, status, vintage, inception_date, aum, currency)
        `)
        .eq('investor_user_id', investorUser!.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!investorUser?.id,
  });

  // Fetch latest metrics for each fund
  const { data: metricsMap } = useQuery({
    queryKey: ['investor-fund-metrics', positions?.map(p => p.fund_id)],
    queryFn: async () => {
      if (!positions?.length) return {};
      
      const fundIds = positions.map(p => p.fund_id);
      const { data, error } = await supabase
        .from('investor_fund_metrics')
        .select('*')
        .in('fund_id', fundIds)
        .order('period_date', { ascending: false });
      
      if (error) throw error;
      
      // Group by fund_id and take the latest
      const map: Record<string, any> = {};
      data?.forEach(metric => {
        if (!map[metric.fund_id]) {
          map[metric.fund_id] = metric;
        }
      });
      return map;
    },
    enabled: !!positions?.length,
  });

  const formatCurrency = (value: number, currency = 'EUR') => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Activo',
      'fundraising': 'En Captación',
      'investing': 'Invirtiendo',
      'harvesting': 'Cosechando',
      'closed': 'Cerrado',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    if (status === 'active' || status === 'investing') return 'default';
    if (status === 'fundraising') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-foreground">Mis Fondos</h1>
        <p className="text-muted-foreground">Detalle de tus inversiones en fondos</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : positions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg text-foreground mb-2">Sin fondos asignados</h3>
            <p className="text-muted-foreground">
              Aún no tienes fondos asignados a tu cuenta. Contacta con tu gestor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions?.map((position) => {
            const fund = position.fund as any;
            const metrics = metricsMap?.[position.fund_id];
            const tvpi = metrics?.tvpi || (
              Number(position.called_capital) > 0 
                ? ((Number(position.distributed_capital) + Number(position.current_nav)) / Number(position.called_capital))
                : 0
            );

            return (
              <Link key={position.id} to={`/investor/funds/${position.fund_id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{fund?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {fund?.type} • Vintage {fund?.vintage}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(fund?.status)}>
                      {getStatusLabel(fund?.status)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Position Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Comprometido</p>
                        <p className="text-lg text-foreground">
                          {formatCurrency(Number(position.committed_capital))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Llamado</p>
                        <p className="text-lg text-foreground">
                          {formatCurrency(Number(position.called_capital))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Distribuido</p>
                        <p className="text-lg text-foreground">
                          {formatCurrency(Number(position.distributed_capital))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">NAV Actual</p>
                        <p className="text-lg text-foreground">
                          {formatCurrency(Number(position.current_nav))}
                        </p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        {metrics?.irr_net && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-foreground">
                              {Number(metrics.irr_net).toFixed(1)}% IRR
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-foreground">
                          {tvpi.toFixed(2)}x TVPI
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {position.ownership_percentage && (
                      <p className="text-xs text-muted-foreground">
                        Participación: {Number(position.ownership_percentage).toFixed(2)}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestorFunds;
