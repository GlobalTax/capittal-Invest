import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useInvestorAuth } from '@/hooks/useInvestorAuth';
import { Link } from 'react-router-dom';

export const InvestorHeader = () => {
  const { investorUser } = useInvestorAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['investor-notifications-count', investorUser?.id],
    queryFn: async () => {
      if (!investorUser?.id) return 0;
      
      const { count, error } = await supabase
        .from('investor_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('investor_user_id', investorUser.id)
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!investorUser?.id,
  });

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg text-foreground">
          Bienvenido, {investorUser?.full_name || 'Inversor'}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/investor/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
};
