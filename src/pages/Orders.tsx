import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Package, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  shipping_address: any;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_id: string;
  }[];
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            product_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      // Orders fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load orders.",
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <>
      <SEOHead
        title="My Orders - Order History & Tracking"
        description="View your order history and track current orders at Ebeth Boutique"
        noIndex={true}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
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
                <Package className="h-6 w-6 text-gold" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                My Orders
              </h1>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
                <Link to="/">
                  <Button>Start Shopping</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Order #{order.order_number}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end space-y-2">
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(order.total_amount, order.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">Order Items</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {order.shipping_address && (
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-2 flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              Shipping Address
                            </h4>
                            <div className="text-sm text-muted-foreground">
                              {typeof order.shipping_address === 'object' ? (
                                <>
                                  <p>{order.shipping_address.address}</p>
                                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                                  <p>{order.shipping_address.country}</p>
                                </>
                              ) : (
                                <p>{order.shipping_address}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Orders;