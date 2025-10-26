import { useAuth } from '@/contexts/AuthContext';

export const useAdminAuth = () => {
  const { adminUser, isAdmin } = useAuth();

  const hasRole = (requiredRole: 'super_admin' | 'admin' | 'editor' | 'viewer') => {
    if (!adminUser) return false;
    
    const roleHierarchy = {
      super_admin: 4,
      admin: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[adminUser.role] >= roleHierarchy[requiredRole];
  };

  const canEdit = () => {
    return isAdmin && hasRole('editor');
  };

  const canPublish = () => {
    return isAdmin && hasRole('admin');
  };

  const canDelete = () => {
    return isAdmin && hasRole('admin');
  };

  const canManageUsers = () => {
    return isAdmin && hasRole('super_admin');
  };

  const requireAdmin = () => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
  };

  const requireSuperAdmin = () => {
    if (!hasRole('super_admin')) {
      throw new Error('Super admin access required');
    }
  };

  return {
    adminUser,
    isAdmin,
    hasRole,
    canEdit,
    canPublish,
    canDelete,
    canManageUsers,
    requireAdmin,
    requireSuperAdmin,
  };
};
