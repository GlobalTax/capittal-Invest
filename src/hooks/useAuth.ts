import { useUnifiedAuth, AdminRole } from '@/contexts/UnifiedAuthContext';

/**
 * Compatibility wrapper for the old AuthContext API.
 * Used by admin components that expect the previous interface.
 */
export const useAuth = () => {
  const ctx = useUnifiedAuth();

  return {
    // User state
    user: ctx.user,
    adminUser: ctx.adminProfile,
    
    // Loading states
    isLoading: ctx.isLoading,
    isAdminLoading: ctx.isProfileLoading,
    adminChecked: ctx.profileChecked,
    
    // Role checks
    isAdmin: ctx.isAdmin,
    
    // Actions
    signIn: async (email: string, password: string) => {
      const result = await ctx.signIn(email, password);
      if (result.error) {
        throw result.error;
      }
      return { 
        user: result.user!, 
        adminUser: result.adminProfile! 
      };
    },
    signOut: ctx.signOut,
  };
};

/**
 * Hook for admin-specific permission checks.
 * Maintains compatibility with existing useAdminAuth patterns.
 */
export const useAdminAuth = () => {
  const ctx = useUnifiedAuth();

  const hasRole = (requiredRole: AdminRole) => {
    return ctx.hasAdminRole(requiredRole);
  };

  const canEdit = () => {
    return ctx.isAdmin && hasRole('editor');
  };

  const canPublish = () => {
    return ctx.isAdmin && hasRole('admin');
  };

  const canDelete = () => {
    return ctx.isAdmin && hasRole('admin');
  };

  const canManageUsers = () => {
    return ctx.isAdmin && hasRole('super_admin');
  };

  const requireAdmin = () => {
    if (!ctx.isAdmin) {
      throw new Error('Admin access required');
    }
  };

  const requireSuperAdmin = () => {
    if (!hasRole('super_admin')) {
      throw new Error('Super admin access required');
    }
  };

  return {
    adminUser: ctx.adminProfile,
    isAdmin: ctx.isAdmin,
    hasRole,
    canEdit,
    canPublish,
    canDelete,
    canManageUsers,
    requireAdmin,
    requireSuperAdmin,
  };
};
