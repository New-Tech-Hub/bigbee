import { ReactNode, useEffect } from 'react';
import { useSuperAdminAuth } from '@/hooks/useSuperAdminAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface SuperAdminRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const SuperAdminRoute = ({ children, redirectTo = '/' }: SuperAdminRouteProps) => {
  const { hasElevatedAccess, loading, user, userRole } = useSuperAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive"
      });
      navigate(redirectTo);
    } else if (!loading && user && !hasElevatedAccess) {
      toast({
        title: "Access Denied",
        description: "This area requires elevated permissions (manager, admin, or super admin).",
        variant: "destructive"
      });
      navigate(redirectTo);
    }
  }, [user, hasElevatedAccess, loading, navigate, redirectTo, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
        <p className="ml-4 text-muted-foreground">
          Verifying access permissions ({userRole})...
        </p>
      </div>
    );
  }

  if (!user || !hasElevatedAccess) {
    return null;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;