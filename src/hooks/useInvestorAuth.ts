import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * Compatibility wrapper for the old InvestorAuthContext API.
 * Used by investor components that expect the previous interface.
 */
export const useInvestorAuth = () => {
  const ctx = useUnifiedAuth();

  return {
    // User state
    user: ctx.user,
    investorUser: ctx.investorProfile,
    
    // Loading state
    isLoading: ctx.isLoading,
    
    // Role check
    isInvestor: ctx.isInvestor,
    
    // Actions - always target investor portal
    signIn: async (email: string, password: string) => {
      const result = await ctx.signIn(email, password, 'investor');
      return { error: result.error };
    },
    
    signOut: ctx.signOut,
    
    refreshInvestorUser: ctx.refreshProfile,
  };
};
