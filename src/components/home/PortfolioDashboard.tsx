import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Briefcase, TrendingUp, Target, Building2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export const PortfolioDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: async () => {
      const [companies, featured, sectors] = await Promise.all([
        supabase.from('portfolio_companies').select('id', { count: 'exact', head: true }),
        supabase.from('portfolio_companies').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('portfolio_companies').select('sector').eq('is_active', true),
      ]);

      // Get unique sectors
      const uniqueSectors = new Set(sectors.data?.map(c => c.sector));

      return {
        total: companies.count || 0,
        featured: featured.count || 0,
        sectors: uniqueSectors.size,
      };
    },
  });

  // Growth chart data (last 6 months simulation)
  const chartData = [
    { month: 'Jan', value: 35 },
    { month: 'Feb', value: 38 },
    { month: 'Mar', value: 41 },
    { month: 'Apr', value: 42 },
    { month: 'May', value: 44 },
    { month: 'Jun', value: stats?.total || 45 },
  ];

  const chartConfig = {
    value: {
      label: "Portfolio Companies",
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-neutral-100 dark:bg-neutral-300 rounded-lg border border-border">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Portfolio Companies',
      value: `${stats?.total || 0}+`,
      icon: Briefcase,
      trend: '+12% YoY',
      bgColor: 'bg-secondary',
    },
    {
      title: 'Active Sectors',
      value: stats?.sectors || 0,
      icon: Building2,
      trend: 'Tech-first',
      bgColor: 'bg-card',
    },
    {
      title: 'Featured Investments',
      value: stats?.featured || 0,
      icon: Target,
      trend: 'Top performers',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="bg-neutral-100 dark:bg-neutral-300 rounded-lg border border-border p-4 md:p-6 space-y-4 min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h3 className="text-lg font-medium text-foreground">Portfolio Dashboard</h3>
          <p className="text-xs text-muted-foreground">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-success/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-medium text-success">Live</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`${stat.bgColor} border-border/50`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-medium text-foreground">{stat.value}</div>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Portfolio Growth (6M)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent-pink))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
