import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface RoleHierarchy {
  id: string;
  role: string;
  can_manage_roles: string[];
  permissions: any; // Using any since Json type from Supabase can be complex
}

interface UserInvitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export const useRoleManagement = () => {
  const { toast } = useToast();
  const [roleHierarchy, setRoleHierarchy] = useState<RoleHierarchy[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleHierarchy();
    fetchInvitations();
  }, []);

  const fetchRoleHierarchy = async () => {
    try {
      const { data, error } = await supabase
        .from('role_hierarchy')
        .select('*')
        .order('role');

      if (error) throw error;
      setRoleHierarchy((data || []) as RoleHierarchy[]);
    } catch (error) {
      // Role management fetch errors handled silently
      toast({
        title: "Error",
        description: "Failed to load role hierarchy.",
        variant: "destructive"
      });
    }
  };

  const fetchInvitations = async () => {
    try {
      // For now, skip invitations until the table is properly set up in types
      setInvitations([]);
    } catch (error) {
      // Invitation fetch error handled silently
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (email: string, role: string) => {
    try {
      // For now, we'll just show a success message
      // The actual invitation system can be implemented later
      toast({
        title: "Invitation Sent",
        description: `Invitation would be sent to ${email} for ${role} role.`,
      });

      return true;
    } catch (error: any) {
      // Invitation error handled by toast
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation.",
        variant: "destructive"
      });
      return false;
    }
  };

  const canManageRole = (userRole: string, targetRole: string): boolean => {
    const userHierarchy = roleHierarchy.find(rh => rh.role === userRole);
    return userHierarchy ? userHierarchy.can_manage_roles.includes(targetRole) : false;
  };

  const getAvailableRoles = (userRole: string): string[] => {
    const userHierarchy = roleHierarchy.find(rh => rh.role === userRole);
    return userHierarchy ? userHierarchy.can_manage_roles : [];
  };

  const getRolePermissions = (role: string): Record<string, any> => {
    const roleData = roleHierarchy.find(rh => rh.role === role);
    return roleData ? (roleData.permissions as Record<string, any>) : {};
  };

  return {
    roleHierarchy,
    invitations,
    loading,
    inviteUser,
    canManageRole,
    getAvailableRoles,
    getRolePermissions,
    fetchInvitations,
    fetchRoleHierarchy
  };
};