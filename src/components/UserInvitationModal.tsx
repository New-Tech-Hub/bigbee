import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useSuperAdminAuth } from "@/hooks/useSuperAdminAuth";

const UserInvitationModal = () => {
  const { userRole } = useSuperAdminAuth();
  const { inviteUser, getAvailableRoles } = useRoleManagement();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = getAvailableRoles(userRole);

  const handleInvite = async () => {
    if (!email || !selectedRole) return;

    setIsLoading(true);
    const success = await inviteUser(email, selectedRole);
    
    if (success) {
      setEmail("");
      setSelectedRole("");
      setIsOpen(false);
    }
    
    setIsLoading(false);
  };

  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to products, orders, users, and analytics';
      case 'manager':
        return 'Access to products, orders, and basic user management';
      case 'customer':
        return 'Standard customer account';
      default:
        return 'Standard access level';
    }
  };

  if (availableRoles.length === 0) {
    return null; // Don't show if user can't manage any roles
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex flex-col">
                      <span className="font-medium">{getRoleDisplayName(role)}</span>
                      <span className="text-xs text-muted-foreground">
                        {getRoleDescription(role)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={!email || !selectedRole || isLoading}
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserInvitationModal;