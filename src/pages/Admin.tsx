import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Settings as SettingsIcon,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch customers count via secure function
      const { data: customerCount } = await supabase
        .rpc('get_customer_count');

      // Calculate stats
      const totalProducts = productsData?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalCustomers = customerCount || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => 
        sum + (order.payment_status === 'paid' ? order.total_amount : 0), 0
      ) || 0;

      setProducts(productsData || []);
              setOrders((ordersData || []).map(order => ({
                ...order,
                profiles: order.profiles && typeof order.profiles === 'object' 
                  ? { full_name: (order.profiles as any)?.full_name || null }
                  : null
              })));
      setStats({
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue
      });
    } catch (error) {
      // Dashboard fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Ebeth Boutique & Exclusive Store</title>
        <meta 
          name="description" 
          content="Admin dashboard for managing Ebeth Boutique store operations." 
        />
      </Helmet>

      <AdminLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your store operations and view performance metrics
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Products</p>
                      <p className="text-2xl font-bold">{stats.totalProducts}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <ShoppingCart className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Orders</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Customers</p>
                      <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-gold" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Management Tabs */}
              <Tabs defaultValue="products" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Product Management</h2>
            <div className="flex gap-2">
              <Link to="/admin/products">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              <Link to="/admin/categories">
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Categories
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Product & Category Management</h3>
              <p className="text-muted-foreground mb-4">
                Use the buttons above to manage your products and categories with full CRUD operations, 
                including bulk CSV upload for products.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="text-left">
                  <h4 className="font-medium mb-2">Product Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create, edit, and delete products</li>
                    <li>• Bulk import via CSV</li>
                    <li>• Stock management</li>
                    <li>• Category assignment</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-medium mb-2">Category Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create and manage categories</li>
                    <li>• SEO-friendly slugs</li>
                    <li>• Product count tracking</li>
                    <li>• Enable/disable categories</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                  <h2 className="text-2xl font-semibold">Order Management</h2>

                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.slice(0, 10).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>{order.profiles?.full_name || 'Unknown'}</TableCell>
                            <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <h2 className="text-2xl font-semibold">Store Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
                      <p className="text-muted-foreground mb-4">Configure payment gateways and methods</p>
                      <Button variant="outline">Configure Paystack</Button>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Shipping Settings</h3>
                      <p className="text-muted-foreground mb-4">Set up shipping zones and rates</p>
                      <Button variant="outline">Manage Shipping</Button>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Store Information</h3>
                      <p className="text-muted-foreground mb-4">Update store details and contact information</p>
                      <Button variant="outline">Edit Store Info</Button>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                      <p className="text-muted-foreground mb-4">Optimize your store for search engines</p>
                      <Button variant="outline">SEO Settings</Button>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default Admin;