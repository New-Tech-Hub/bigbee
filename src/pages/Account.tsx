import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Package, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <>
      <SEOHead
        title="My Account - Dashboard & Settings"
        description="Manage your Ebeth Boutique account, view orders, wishlist, and update your preferences"
        noIndex={true}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              My Account
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-elegant transition-smooth">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gold/20 rounded-full">
                    <User className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Profile</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Manage your personal information and preferences
                </p>
                <Link to="/profile">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-elegant transition-smooth">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gold/20 rounded-full">
                    <Package className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Orders</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  View your order history and track current orders
                </p>
                <Link to="/orders">
                  <Button variant="outline" className="w-full">
                    View Orders
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-elegant transition-smooth">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gold/20 rounded-full">
                    <Heart className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Wishlist</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  View your saved items and favorites
                </p>
                <Link to="/wishlist">
                  <Button variant="outline" className="w-full">
                    View Wishlist
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-elegant transition-smooth">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-gold/20 rounded-full">
                    <Settings className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Settings</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Manage your account settings and notifications
                </p>
                <Link to="/settings">
                  <Button variant="outline" className="w-full">
                    Account Settings
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-elegant transition-smooth">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-destructive/20 rounded-full">
                    <LogOut className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Sign Out</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Securely sign out of your account
                </p>
              <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                Sign Out
              </Button>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Account;