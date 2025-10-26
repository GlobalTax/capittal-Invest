import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminUser = async (userId: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (!error && data) {
      const adminUserData = data as AdminUser;
      setAdminUser(adminUserData);
      return adminUserData;
    } else {
      setAdminUser(null);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminUser(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminUser(session.user.id);
      } else {
        setAdminUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Intentar con edge function primero usando supabase.functions.invoke
      try {
        const { data, error: functionError } = await supabase.functions.invoke('admin-auth', {
          body: { email, password },
        });

        if (!functionError && data) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (sessionError) throw sessionError;
          setAdminUser(data.adminUser);
          return;
        }
      } catch (functionError) {
        console.log('Edge Function not available, using fallback authentication');
      }

      // Si falla, intentar con supabase auth directamente
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verificar que es admin
      const adminData = await fetchAdminUser(authData.user.id);
      
      if (!adminData) {
        // Log intento de acceso no autorizado (silenciar errores de RLS)
        try {
          await supabase.from('security_events').insert({
            event_type: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
            severity: 'high',
            user_id: authData.user.id,
            details: {
              email,
              fallback_mode: true,
            },
          });
        } catch (logError) {
          console.warn('Security event logging failed (fallback mode):', logError);
        }

        await supabase.auth.signOut();
        throw new Error('Access denied: Not an admin user');
      }

      // Actualizar last_login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      // Log acceso exitoso (silenciar errores de RLS)
      try {
        await supabase.from('security_events').insert({
          event_type: 'ADMIN_LOGIN_SUCCESS',
          severity: 'info',
          user_id: authData.user.id,
          details: {
            email: adminData.email,
            role: adminData.role,
            fallback_mode: true,
          },
        });
      } catch (logError) {
        // Ignorar errores de logging en fallback mode
        console.warn('Security event logging failed (fallback mode):', logError);
      }

      setAdminUser(adminData);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        isAdmin: !!adminUser,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
