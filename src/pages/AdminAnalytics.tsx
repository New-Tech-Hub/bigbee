import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Calendar,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number; value: number }>;
  categoryRevenue: Array<{ category: string; revenue: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysBack = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch orders with details
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            total_price,
            products (name, categories (name))
          )
        `)
        .gte('created_at', startDate.toISOString());

      // Fetch all customers
      const { data: customers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Fetch products
      const { data: products } = await supabase
        .from('products')
        .select('*');

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => 
        sum + (order.payment_status === 'paid' ? order.total_amount : 0), 0
      ) || 0;

      const totalOrders = orders?.length || 0;
      const totalCustomers = customers?.length || 0;
      const totalProducts = products?.length || 0;

      // Calculate growth (compare with previous period)
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - (daysBack * 2));
      const { data: prevOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const { data: prevCustomers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      const prevRevenue = prevOrders?.reduce((sum, order) => 
        sum + (order.payment_status === 'paid' ? order.total_amount : 0), 0
      ) || 0;

      const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const ordersGrowth = prevOrders?.length ? ((totalOrders - prevOrders.length) / prevOrders.length) * 100 : 0;
      const customersGrowth = prevCustomers?.length ? ((totalCustomers - prevCustomers.length) / prevCustomers.length) * 100 : 0;

      // Daily sales data
      const dailySales = Array.from({ length: daysBack }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (daysBack - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const dayOrders = orders?.filter(order => 
          order.created_at.startsWith(dateStr)
        ) || [];
        
        return {
          date: dateStr,
          revenue: dayOrders.reduce((sum, order) => 
            sum + (order.payment_status === 'paid' ? order.total_amount : 0), 0
          ),
          orders: dayOrders.length
        };
      });

      // Top products
      const productSales: Record<string, { sales: number; revenue: number; name: string }> = {};
      
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productName = item.products?.name || 'Unknown Product';
          if (!productSales[productName]) {
            productSales[productName] = { sales: 0, revenue: 0, name: productName };
          }
          productSales[productName].sales += item.quantity;
          productSales[productName].revenue += item.total_price;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Orders by status
      const statusCounts: Record<string, number> = {};
      orders?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        value: count
      }));

      // Category revenue
      const categoryRevenue: Record<string, number> = {};
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const categoryName = item.products?.categories?.name || 'Uncategorized';
          categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + item.total_price;
        });
      });

      const categoryRevenueArray = Object.entries(categoryRevenue)
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        dailySales,
        topProducts,
        ordersByStatus,
        categoryRevenue: categoryRevenueArray
      });
    } catch (error) {
      // Analytics fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const StatCard = ({ title, value, growth, icon: Icon, format = (v: any) => v }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{format(value)}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Analytics - Admin Dashboard</title>
      </Helmet>

      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Detailed insights into your store performance</p>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading analytics...</p>
            </div>
          ) : analytics && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={analytics.totalRevenue}
                  growth={analytics.revenueGrowth}
                  icon={DollarSign}
                  format={formatCurrency}
                />
                <StatCard
                  title="Total Orders"
                  value={analytics.totalOrders}
                  growth={analytics.ordersGrowth}
                  icon={ShoppingCart}
                />
                <StatCard
                  title="New Customers"
                  value={analytics.totalCustomers}
                  growth={analytics.customersGrowth}
                  icon={Users}
                />
                <StatCard
                  title="Total Products"
                  value={analytics.totalProducts}
                  icon={Package}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Daily Sales</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status} (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topProducts} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.categoryRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalytics;