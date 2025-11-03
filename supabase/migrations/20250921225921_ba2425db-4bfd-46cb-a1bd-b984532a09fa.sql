-- Create enhanced inventory management with stock deduction trigger
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product stock when order items are inserted
  UPDATE products 
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Check if stock goes below zero and alert
  IF (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product ID %', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stock deduction
CREATE TRIGGER trigger_decrease_stock
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_stock();

-- Create delivery time slots table
CREATE TABLE public.delivery_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 10,
  current_orders INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery slots
CREATE POLICY "Delivery slots are viewable by everyone" 
ON public.delivery_slots 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage delivery slots" 
ON public.delivery_slots 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Add delivery slot to orders
ALTER TABLE public.orders 
ADD COLUMN delivery_slot_id UUID REFERENCES public.delivery_slots(id),
ADD COLUMN tracking_number TEXT,
ADD COLUMN delivery_instructions TEXT;

-- Create order status history for tracking
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for order status history
CREATE POLICY "Users can view their own order history" 
ON public.order_status_history 
FOR SELECT 
USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all order history" 
ON public.order_status_history 
FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Add trigger for order status history
CREATE OR REPLACE FUNCTION track_order_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, notes, created_by)
    VALUES (NEW.id, NEW.status, 'Status updated', auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_order_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_changes();

-- Add trigger for delivery slots timestamp
CREATE TRIGGER update_delivery_slots_updated_at
BEFORE UPDATE ON public.delivery_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_delivery_slots_date ON delivery_slots(date);
CREATE INDEX idx_orders_tracking ON orders(tracking_number);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- Create product wishlist table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlist
CREATE POLICY "Users can manage their own wishlist" 
ON public.wishlist_items 
FOR ALL 
USING (auth.uid() = user_id);

-- Add role column to profiles for admin access
ALTER TABLE public.profiles 
ADD COLUMN role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff'));

-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics
CREATE POLICY "Users can create their own events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Add indexes for analytics
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_date ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);