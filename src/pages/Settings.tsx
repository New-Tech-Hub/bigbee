import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Settings as SettingsIcon, Bell, Mail, Shield, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveNotifications = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
    
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    // This would typically involve calling a secure endpoint
    toast({
      title: "Account Deletion",
      description: "Account deletion requests are processed within 48 hours. Please contact support if you need assistance.",
      variant: "destructive"
    });
  };

  return (
    <>
      <SEOHead
        title="Account Settings - Manage Preferences"
        description="Manage your account settings, notifications, and privacy preferences at Ebeth Boutique"
        noIndex={true}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <Link to="/account">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Account
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-gold/20 rounded-full">
                <SettingsIcon className="h-6 w-6 text-gold" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Account Settings
              </h1>
            </div>

            <div className="space-y-6">
              {/* Notification Settings */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="h-5 w-5 text-gold" />
                  <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about your account activity
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS updates about your orders
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="order-updates">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about order status changes
                      </p>
                    </div>
                    <Switch
                      id="order-updates"
                      checked={orderUpdates}
                      onCheckedChange={setOrderUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="promotional-emails">Promotional Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about sales, new arrivals, and special offers
                      </p>
                    </div>
                    <Switch
                      id="promotional-emails"
                      checked={promotionalEmails}
                      onCheckedChange={setPromotionalEmails}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Notification Settings'
                    )}
                  </Button>
                </div>
              </Card>

              {/* Privacy Settings */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="h-5 w-5 text-gold" />
                  <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Password</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Change your password regularly to keep your account secure
                    </p>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Login Sessions</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Manage your active login sessions across devices
                    </p>
                    <Button variant="outline" size="sm">
                      View Sessions
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Account Management */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Mail className="h-5 w-5 text-gold" />
                  <h2 className="text-xl font-semibold text-foreground">Account Management</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Download Your Data</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download a copy of your account data and order history
                    </p>
                    <Button variant="outline" size="sm">
                      Request Data Export
                    </Button>
                  </div>

                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <h3 className="font-medium text-foreground mb-2 flex items-center">
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      Delete Account
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers. All your order history, saved items,
                            and preferences will be lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Settings;