import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CreditCard, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DeliverySlotSelector from "@/components/DeliverySlotSelector";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Textarea } from "@/components/ui/textarea";
import OptimizedImage from "@/components/OptimizedImage";
// Security utilities for input validation
import { sanitizeInput, validatePhoneNumber, validateAddress, detectSuspiciousInput } from "@/utils/sanitize";

// Define the interface for delivery slots
interface DeliverySlot {
  id: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  available: boolean;
}

interface UserProfile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  products?: {
    name: string;
    price: number;
    image_url: string;
    currency: string;
  };
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  notes: string;
}

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackPurchase } = useAnalytics();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchUserProfile();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            name,
            price,
            image_url,
            currency
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        return;
      }

      if (data) {
        const nameParts = data.full_name?.split(' ') || ['', ''];
        setForm(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'Nigeria'
        }));
      }
    } catch (error) {
      return;
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.products?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getShippingCost = () => {
    const total = getTotalPrice();
    return total >= 150000 ? 0 : 5000;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost();
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive"
      });
      return;
    }

    // ===== SECURITY: Input Validation & Sanitization =====
    
    // 1. Sanitize all text inputs
    const sanitizedFirstName = sanitizeInput(form.firstName);
    const sanitizedLastName = sanitizeInput(form.lastName);
    const sanitizedAddress = sanitizeInput(form.address);
    const sanitizedCity = sanitizeInput(form.city);
    const sanitizedState = sanitizeInput(form.state);
    const sanitizedCountry = sanitizeInput(form.country);
    const sanitizedPostalCode = sanitizeInput(form.postalCode);
    const sanitizedNotes = sanitizeInput(form.notes);
    
    // 2. Validate phone number (Nigerian format)
    const phoneValidation = validatePhoneNumber(form.phone);
    if (!phoneValidation.isValid) {
      toast({
        title: "Invalid Phone Number",
        description: phoneValidation.message,
        variant: "destructive"
      });
      return;
    }
    
    // 3. Validate address
    const addressValidation = validateAddress(sanitizedAddress);
    if (!addressValidation.isValid) {
      toast({
        title: "Invalid Address",
        description: addressValidation.message,
        variant: "destructive"
      });
      return;
    }
    
    // 4. Check for suspicious patterns in text fields
    const fieldsToCheck = [
      { name: 'First Name', value: sanitizedFirstName },
      { name: 'Last Name', value: sanitizedLastName },
      { name: 'City', value: sanitizedCity },
      { name: 'State', value: sanitizedState },
      { name: 'Notes', value: sanitizedNotes }
    ];
    
    for (const field of fieldsToCheck) {
      if (detectSuspiciousInput(field.value)) {
        toast({
          title: "Invalid Input",
          description: `${field.name} contains invalid characters. Please try again.`,
          variant: "destructive"
        });
        return;
      }
    }

    setProcessing(true);
    
    try {
      // Create order record with sanitized data
      const orderData = {
        user_id: user!.id,
        order_number: `EB-${Date.now()}`,
        total_amount: getFinalTotal(),
        currency: 'NGE',
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'paystack',
        delivery_slot_id: selectedDeliverySlot,
        delivery_instructions: sanitizedNotes, // ✅ Sanitized
        shipping_address: {
          firstName: sanitizedFirstName,   // ✅ Sanitized
          lastName: sanitizedLastName,     // ✅ Sanitized
          email: form.email,               // ✅ HTML5 validated
          phone: form.phone,               // ✅ Validated
          address: sanitizedAddress,       // ✅ Sanitized & validated
          city: sanitizedCity,             // ✅ Sanitized
          state: sanitizedState,           // ✅ Sanitized
          country: sanitizedCountry,       // ✅ Sanitized
          postalCode: sanitizedPostalCode, // ✅ Sanitized
          notes: sanitizedNotes            // ✅ Sanitized
        }
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products?.price || 0,
        total_price: (item.products?.price || 0) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id);

      if (cartError) throw cartError;

      // Track purchase
      trackPurchase(
        order.id,
        getFinalTotal(),
        'NGE',
        cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products?.price || 0
        }))
      );

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.order_number} has been created.`
      });

      // Redirect to orders
      navigate('/orders');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to checkout</h1>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Secure Checkout - Complete Your Order"
        description="Complete your purchase securely at Ebeth Boutique. Fast checkout with multiple payment options."
        noIndex={true}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Checkout
            </h1>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading checkout...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Add some items to your cart to proceed with checkout.
                </p>
                <Link to="/">
                  <Button>Start Shopping</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Checkout Form */}
                <div>
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Shipping Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          type="text"
                          id="firstName"
                          placeholder="John"
                          value={form.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          type="text"
                          id="lastName"
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          placeholder="john.doe@example.com"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          type="tel"
                          id="phone"
                          placeholder="08012345678"
                          value={form.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          type="text"
                          id="address"
                          placeholder="123 Main Street"
                          value={form.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          type="text"
                          id="city"
                          placeholder="Lagos"
                          value={form.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          type="text"
                          id="state"
                          placeholder="Lagos State"
                          value={form.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          type="text"
                          id="country"
                          value={form.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          readOnly
                        />
                      </div>

                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          type="text"
                          id="postalCode"
                          placeholder="100001"
                          value={form.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Delivery Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any special instructions for delivery?"
                          value={form.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                        />
                      </div>
                      
                      {/* Delivery Slot */}
                      <div className="mt-6">
                        <DeliverySlotSelector
                          selectedSlotId={selectedDeliverySlot}
                          onSlotSelect={setSelectedDeliverySlot}
                        />
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <OptimizedImage
                              src={item.products?.image_url}
                              alt={item.products?.name}
                              className="w-12 h-12 object-cover rounded mr-4"
                              width={48}
                              height={48}
                            />
                            <div>
                              <p className="font-semibold">{item.products?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div>
                            {formatCurrency((item.products?.price || 0) * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between font-semibold">
                      <p>Subtotal</p>
                      <p>{formatCurrency(getTotalPrice())}</p>
                    </div>

                    <div className="flex justify-between font-semibold">
                      <p>Shipping</p>
                      <p>{formatCurrency(getShippingCost())}</p>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between text-lg font-bold">
                      <p>Total</p>
                      <p>{formatCurrency(getFinalTotal())}</p>
                    </div>

                    <Button 
                      className="w-full mt-6" 
                      onClick={handleSubmit}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      By placing this order, you agree to our Terms & Conditions.
                    </p>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Checkout;
