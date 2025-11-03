import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UserInvitationModal from "@/components/UserInvitationModal";
import { useSuperAdminAuth } from "@/hooks/useSuperAdminAuth";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, Users, Crown } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  primary_role: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const { userRole, canManageUsers, isSuperAdmin } = useSuperAdminAuth();
  const { canManageRole, getAvailableRoles } = useRoleManagement();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their primary role
      const usersWithRoles = profilesData?.map(profile => {
        const userRoles = rolesData?.filter(r => r.user_id === profile.user_id) || [];
        
        // Determine primary role (highest privilege)
        let primaryRole = 'customer';
        if (userRoles.some(r => r.role === 'super_admin')) {
          primaryRole = 'super_admin';
        } else if (userRoles.some(r => r.role === 'admin')) {
          primaryRole = 'admin';
        } else if (userRoles.some(r => r.role === 'manager')) {
          primaryRole = 'manager';
        }
        
        return {
          ...profile,
          primary_role: primaryRole
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      // Users fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    // Check if the current user can manage the target role
    if (!canManageRole(userRole, newRole)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to assign the ${newRole} role.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the target user's user_id from profiles
      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) throw new Error('User not found');

      // Delete all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', targetUser.user_id);

      if (deleteError) throw deleteError;

      // Insert the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: targetUser.user_id,
          role: newRole as any // Cast to avoid type issues with enum
        }]);

      if (insertError) throw insertError;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, primary_role: newRole } : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
    } catch (error: any) {
      // Role update error handled by toast
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'customer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-3 w-3 text-purple-600" />;
      case 'admin':
        return <Crown className="h-3 w-3" />;
      case 'manager':
        return <Shield className="h-3 w-3" />;
      case 'customer':
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const availableRoles = getAvailableRoles(userRole);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.primary_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>User Management - Admin Dashboard</title>
      </Helmet>

      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">
                Manage user accounts and roles {!isSuperAdmin && `(${userRole} access)`}
              </p>
            </div>
            {canManageUsers && <UserInvitationModal />}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading users...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={`${getRoleColor(user.primary_role)} flex items-center gap-1`}>
                            {getRoleIcon(user.primary_role)}
                            {user.primary_role.replace('_', ' ').charAt(0).toUpperCase() + user.primary_role.replace('_', ' ').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.city && user.state 
                            ? `${user.city}, ${user.state}`
                            : user.country || 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {canManageRole(userRole, user.primary_role) || user.primary_role === 'customer' ? (
                              <Select
                                value={user.primary_role}
                                onValueChange={(value) => updateUserRole(user.id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="customer">Customer</SelectItem>
                                  {availableRoles.map(role => (
                                    <SelectItem key={role} value={role}>
                                      {role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="w-40 justify-center">
                                No Access
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminUsers;