import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Types
export type UserType = 'admin' | 'investor' | 'public' | null;
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
}

export interface InvestorProfile {
  id: string;
  user_id: string;
  lp_id: string | null;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: 'pending' | 'active' | 'suspended';
  last_login_at: string | null;
}

interface SignInResult {
  user: User | null;
  error: Error | null;
  userType: UserType;
  adminProfile?: AdminProfile | null;
  investorProfile?: InvestorProfile | null;
}

interface UnifiedAuthContextType {
  // Base Supabase state
  user: User | null;
  isLoading: boolean;
  
  // Detected user type
  userType: UserType;
  
  // Specific profiles (only one will be populated)
  adminProfile: AdminProfile | null;
  investorProfile: InvestorProfile | null;
  
  // Verification states
  profileChecked: boolean;
  isProfileLoading: boolean;
  
  // Role helpers
  isAdmin: boolean;
  isInvestor: boolean;
  hasAdminRole: (role: AdminRole) => boolean;
  
  // Actions
  signIn: (email: string, password: string, targetPortal?: 'admin' | 'investor') => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// Role hierarchy for permission checks
const roleHierarchy: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

export const UnifiedAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
  // Ref to prevent onAuthStateChange from overwriting state during signIn
  const signInInProgressRef = useRef(false);

  // Detect user type and fetch appropriate profile
  const detectUserType = useCallback(async (userId: string): Promise<{
    type: UserType;
    admin: AdminProfile | null;
    investor: InvestorProfile | null;
  }> => {
    // 1. Check admin_users first
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, user_id, email, full_name, role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminError && adminData) {
      return { 
        type: 'admin', 
        admin: adminData as AdminProfile, 
        investor: null 
      };
    }

    // 2. Check investor_users
    const { data: investorData, error: investorError } = await supabase
      .from('investor_users')
      .select('id, user_id, lp_id, email, full_name, phone, status, last_login_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (!investorError && investorData) {
      return { 
        type: investorData.status === 'active' ? 'investor' : 'public',
        admin: null, 
        investor: investorData as InvestorProfile 
      };
    }

    // 3. Public user (authenticated but no special role)
    return { type: 'public', admin: null, investor: null };
  }, []);

  // Load profile for current user
  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUserType(null);
      setAdminProfile(null);
      setInvestorProfile(null);
      setProfileChecked(true);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    try {
      const result = await detectUserType(currentUser.id);
      setUserType(result.type);
      setAdminProfile(result.admin);
      setInvestorProfile(result.investor);
    } catch (error) {
      console.error('Error detecting user type:', error);
      setUserType('public');
      setAdminProfile(null);
      setInvestorProfile(null);
    } finally {
      setProfileChecked(true);
      setIsProfileLoading(false);
    }
  }, [detectUserType]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  // Update last login for investor
  const updateInvestorLastLogin = useCallback(async (userId: string) => {
    try {
      await supabase
        .from('investor_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }, []);

  // Update last login for admin
  const updateAdminLastLogin = useCallback(async (userId: string) => {
    try {
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating admin last login:', error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          await loadProfile(currentUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
          setProfileChecked(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Skip profile loading if signIn() already handled it
        if (signInInProgressRef.current) {
          return;
        }

        if (event === 'SIGNED_IN' && currentUser) {
          await loadProfile(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUserType(null);
          setAdminProfile(null);
          setInvestorProfile(null);
          setProfileChecked(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Sign in with optional target portal hint
  const signIn = async (
    email: string, 
    password: string, 
    targetPortal?: 'admin' | 'investor'
  ): Promise<SignInResult> => {
    // Set flag to prevent onAuthStateChange from overwriting our state
    signInInProgressRef.current = true;
    
    try {
      // For admin login, try the edge function first
      if (targetPortal === 'admin') {
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('admin-auth', {
            body: { email, password }
          });

          if (edgeError) {
            console.error('Edge function error:', edgeError);
            // Fall through to standard auth
          } else if (edgeData?.session) {
            // Set the session locally with tokens from edge function
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: edgeData.session.access_token,
              refresh_token: edgeData.session.refresh_token
            });

            if (!setSessionError) {
              const sessionUser = edgeData.session.user;
              setUser(sessionUser);

              // Use admin profile data from edge function response
              const adminProfileData: AdminProfile = {
                id: edgeData.adminUser.id,
                user_id: edgeData.adminUser.user_id,
                email: edgeData.adminUser.email,
                full_name: edgeData.adminUser.full_name,
                role: edgeData.adminUser.role,
                is_active: true
              };

              setUserType('admin');
              setAdminProfile(adminProfileData);
              setInvestorProfile(null);
              setProfileChecked(true);

              return { user: sessionUser, error: null, userType: 'admin', adminProfile: adminProfileData };
            }
          } else if (edgeData?.error) {
            // Handle specific errors from edge function (rate limit, etc.)
            const error = new Error(edgeData.error) as Error & { 
              remainingAttempts?: number; 
              lockoutUntil?: string; 
            };
            error.remainingAttempts = edgeData.remaining_attempts;
            error.lockoutUntil = edgeData.lockout_until;
            return { user: null, error, userType: null, adminProfile: null, investorProfile: null };
          }
        } catch (edgeFnError) {
          console.log('Edge function not available, falling back to direct auth');
        }
      }

      // Standard sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error, userType: null, adminProfile: null, investorProfile: null };
      }

      if (data.user) {
        setUser(data.user);
        const result = await detectUserType(data.user.id);
        setUserType(result.type);
        setAdminProfile(result.admin);
        setInvestorProfile(result.investor);
        setProfileChecked(true);

        // Update last login based on detected type
        if (result.type === 'admin') {
          await updateAdminLastLogin(data.user.id);
        } else if (result.type === 'investor') {
          await updateInvestorLastLogin(data.user.id);
        }

        // Validate against target portal if specified
        if (targetPortal === 'admin' && result.type !== 'admin') {
          await supabase.auth.signOut();
          return { 
            user: null, 
            error: new Error('No tienes permisos de administrador'), 
            userType: null 
          };
        }

        if (targetPortal === 'investor' && result.type !== 'investor') {
          await supabase.auth.signOut();
          return { 
            user: null, 
            error: new Error('No tienes acceso al portal de inversores'), 
            userType: null 
          };
        }

        return { user: data.user, error: null, userType: result.type, adminProfile: result.admin, investorProfile: result.investor };
      }

      return { user: null, error: new Error('Error desconocido'), userType: null, adminProfile: null, investorProfile: null };
    } catch (error) {
      return { user: null, error: error as Error, userType: null, adminProfile: null, investorProfile: null };
    } finally {
      // Reset flag after a small delay to ensure onAuthStateChange has processed
      setTimeout(() => {
        signInInProgressRef.current = false;
      }, 100);
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setAdminProfile(null);
    setInvestorProfile(null);
    setProfileChecked(true);
  };

  // Check if user has a specific admin role
  const hasAdminRole = (requiredRole: AdminRole): boolean => {
    if (!adminProfile) return false;
    return roleHierarchy[adminProfile.role] >= roleHierarchy[requiredRole];
  };

  const value: UnifiedAuthContextType = {
    user,
    isLoading,
    userType,
    adminProfile,
    investorProfile,
    profileChecked,
    isProfileLoading,
    isAdmin: userType === 'admin',
    isInvestor: userType === 'investor',
    hasAdminRole,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within an UnifiedAuthProvider');
  }
  return context;
};
