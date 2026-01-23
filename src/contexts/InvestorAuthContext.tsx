import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface InvestorUser {
  id: string;
  user_id: string;
  lp_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: 'pending' | 'active' | 'suspended';
  last_login_at: string | null;
}

interface InvestorAuthContextType {
  user: User | null;
  investorUser: InvestorUser | null;
  isLoading: boolean;
  isInvestor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshInvestorUser: () => Promise<void>;
}

const InvestorAuthContext = createContext<InvestorAuthContextType | undefined>(undefined);

export const InvestorAuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('[InvestorAuthProvider] Mounting provider');
  const [user, setUser] = useState<User | null>(null);
  const [investorUser, setInvestorUser] = useState<InvestorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestorUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('investor_users')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching investor user:', error);
        return null;
      }

      return data as InvestorUser | null;
    } catch (error) {
      console.error('Error in fetchInvestorUser:', error);
      return null;
    }
  };

  const refreshInvestorUser = async () => {
    if (user) {
      const investor = await fetchInvestorUser(user.id);
      setInvestorUser(investor);
    }
  };

  useEffect(() => {
    const isInvestorRoute = () => window.location.pathname.startsWith('/investor');

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Only fetch investor data if on investor route
          if (isInvestorRoute()) {
            const investor = await fetchInvestorUser(session.user.id);
            setInvestorUser(investor);
          }
        }
      } catch (error) {
        console.error('Error initializing investor auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Only process investor-specific logic if on investor routes
        // This prevents interference with admin login flow
        if (isInvestorRoute()) {
          const investor = await fetchInvestorUser(session.user.id);
          setInvestorUser(investor);
          
          // Update last login only for investors
          if (investor) {
            await supabase
              .from('investor_users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', investor.id);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setInvestorUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setInvestorUser(null);
  };

  return (
    <InvestorAuthContext.Provider
      value={{
        user,
        investorUser,
        isLoading,
        isInvestor: !!investorUser && investorUser.status === 'active',
        signIn,
        signOut,
        refreshInvestorUser,
      }}
    >
      {children}
    </InvestorAuthContext.Provider>
  );
};

export const useInvestorAuth = () => {
  const context = useContext(InvestorAuthContext);
  if (context === undefined) {
    throw new Error('useInvestorAuth must be used within an InvestorAuthProvider');
  }
  return context;
};
