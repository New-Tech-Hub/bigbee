import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Store, 
  CreditCard, 
  Truck, 
  Search, 
  Mail, 
  Globe, 
  Shield,
  Save,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StoreSettings {
  store_name: string;
  store_description: string;
  store_address: string;
  store_phone: string;
  store_email: string;
  store_website: string;
  currency: string;
  tax_rate: number;
  shipping_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: "Ebeth Boutique & Exclusive Store",
    store_description: "Your premier destination for fashion, beauty, and lifestyle products",
    store_address: "Lagos, Nigeria",
    store_phone: "+234 803 123 4567",
    store_email: "info@ebethboutique.com",
    store_website: "https://ebethboutique.com",
    currency: "NGN",
    tax_rate: 7.5,
    shipping_enabled: true,
    email_notifications: true,
    sms_notifications: false
  });

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');

      if (error) throw error;

      // Convert array of key-value pairs to object
      const settingsObj: any = {};
      data?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });

      // Merge with defaults
      setSettings(prev => ({
        ...prev,
        ...settingsObj,
        tax_rate: parseFloat(settingsObj.tax_rate || '7.5'),
        shipping_enabled: settingsObj.shipping_enabled === 'true',
        email_notifications: settingsObj.email_notifications === 'true',
        sms_notifications: settingsObj.sms_notifications === 'true'
      }));
    } catch (error) {
      // Settings fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load store settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStoreSettings = async () => {
    setSaving(true);
    try {
      // Convert settings object to array of key-value pairs
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value.toString(),
        updated_at: new Date().toISOString()
      }));

      // Upsert each setting
      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('store_settings')
          .upsert(setting, { 
            onConflict: 'setting_key',
            ignoreDuplicates: false 
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Store settings saved successfully."
      });
    } catch (error) {
      // Save error handled by toast
      toast({
        title: "Error",
        description: "Failed to save store settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof StoreSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          <p className="ml-4 text-muted-foreground">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Store Settings - Admin Dashboard</title>
        <meta name="description" content="Manage store configuration and settings" />
      </Helmet>

      <AdminLayout>
        <div className="p-6 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Store Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your store settings, payment options, and preferences
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Store className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="shipping">
                <Truck className="h-4 w-4 mr-2" />
                Shipping
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Mail className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Store Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="store_name">Store Name</Label>
                      <Input
                        id="store_name"
                        value={settings.store_name}
                        onChange={(e) => handleInputChange('store_name', e.target.value)}
                        placeholder="Enter store name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store_email">Store Email</Label>
                      <Input
                        id="store_email"
                        type="email"
                        value={settings.store_email}
                        onChange={(e) => handleInputChange('store_email', e.target.value)}
                        placeholder="Enter store email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store_phone">Store Phone</Label>
                      <Input
                        id="store_phone"
                        value={settings.store_phone}
                        onChange={(e) => handleInputChange('store_phone', e.target.value)}
                        placeholder="Enter store phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store_website">Website URL</Label>
                      <Input
                        id="store_website"
                        value={settings.store_website}
                        onChange={(e) => handleInputChange('store_website', e.target.value)}
                        placeholder="Enter website URL"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store_description">Store Description</Label>
                    <Textarea
                      id="store_description"
                      value={settings.store_description}
                      onChange={(e) => handleInputChange('store_description', e.target.value)}
                      placeholder="Describe your store"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store_address">Store Address</Label>
                    <Textarea
                      id="store_address"
                      value={settings.store_address}
                      onChange={(e) => handleInputChange('store_address', e.target.value)}
                      placeholder="Enter full store address"
                      rows={2}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Input
                        id="currency"
                        value={settings.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        placeholder="NGN"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.1"
                        value={settings.tax_rate}
                        onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                        placeholder="7.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure payment gateways and methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Paystack Integration</h3>
                    <p className="text-muted-foreground mb-4">
                      Paystack is your primary payment gateway. Configure your API keys in the environment variables.
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Status: <span className="text-green-600">Active</span></p>
                        <p className="text-sm text-muted-foreground">Connected and ready to process payments</p>
                      </div>
                      <Button variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Supported Payment Methods</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span>Credit/Debit Cards</span>
                        <Switch checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bank Transfer</span>
                        <Switch checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mobile Money</span>
                        <Switch checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>USSD</span>
                        <Switch checked={true} disabled />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage shipping options and delivery settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="shipping_enabled" className="text-base font-medium">
                        Enable Shipping
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to choose delivery options
                      </p>
                    </div>
                    <Switch
                      id="shipping_enabled"
                      checked={settings.shipping_enabled}
                      onCheckedChange={(checked) => handleInputChange('shipping_enabled', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Delivery Zones</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure delivery zones and time slots for your store.
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Lagos Mainland</p>
                          <p className="text-sm text-muted-foreground">Free delivery for orders above ₦15,000</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Lagos Island</p>
                          <p className="text-sm text-muted-foreground">₦2,000 delivery fee</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Other States</p>
                          <p className="text-sm text-muted-foreground">₦3,500 delivery fee</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how you want to be notified about store activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_notifications" className="text-base font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for new orders and important events
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms_notifications" className="text-base font-medium">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS alerts for urgent store events
                      </p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={settings.sms_notifications}
                      onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>New Orders</span>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Low Stock Alerts</span>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Confirmations</span>
                        <Switch checked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Customer Reviews</span>
                        <Switch checked={false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Security Alerts</span>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={fetchStoreSettings} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveStoreSettings} disabled={saving}>
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettings;