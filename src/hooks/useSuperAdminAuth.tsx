import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdminAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [userRole, setUserRole] = useState<string>('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setIsManager(false);
        setUserRole('customer');
        setLoading(false);
        return;
      }

      try {
        // Query user_roles table for all roles
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          // Role check error handled silently
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setIsManager(false);
          setUserRole('customer');
        } else {
          const userRoles = roles?.map(r => r.role) || ['customer'];
          
          // Determine primary role (highest privilege)
          const hasSuperAdmin = userRoles.includes('super_admin');
          const hasAdmin = userRoles.includes('admin');
          const hasManager = userRoles.includes('manager');
          
          setIsSuperAdmin(hasSuperAdmin);
          setIsAdmin(hasSuperAdmin || hasAdmin);
          setIsManager(hasSuperAdmin || hasAdmin || hasManager);
          
          // Set primary role for display
          if (hasSuperAdmin) {
            setUserRole('super_admin');
          } else if (hasAdmin) {
            setUserRole('admin');
          } else if (hasManager) {
            setUserRole('manager');
          } else {
            setUserRole('customer');
          }
        }
      } catch (error) {
        // Role check error handled silently
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setIsManager(false);
        setUserRole('customer');
      }

      setLoading(false);
    };

    if (!authLoading) {
      checkUserRoles();
    }
  }, [user, authLoading]);

  return {
    isSuperAdmin,
    isAdmin,
    isManager,
    userRole,
    loading: loading || authLoading,
    user,
    // Helper functions for role checks
    canManageUsers: isSuperAdmin || isAdmin,
    canManageProducts: isSuperAdmin || isAdmin || isManager,
    canViewAnalytics: isSuperAdmin || isAdmin,
    hasElevatedAccess: isSuperAdmin || isAdmin || isManager
  };
};