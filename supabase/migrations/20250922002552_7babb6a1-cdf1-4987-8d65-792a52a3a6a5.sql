-- Create discount coupons table
CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Coupons are viewable by everyone"
ON public.discount_coupons
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Only admins can manage coupons"
ON public.discount_coupons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create order_coupons table to track coupon usage
CREATE TABLE public.order_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES discount_coupons(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for order_coupons
CREATE POLICY "Users can view their order coupons"
ON public.order_coupons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_coupons.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create order coupons for their orders"
ON public.order_coupons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_coupons.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Create function to update coupon usage
CREATE OR REPLACE FUNCTION update_coupon_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment used_count when order_coupon is created
  IF TG_OP = 'INSERT' THEN
    UPDATE discount_coupons 
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE id = NEW.coupon_id;
    RETURN NEW;
  END IF;
  
  -- Decrement used_count when order_coupon is deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE discount_coupons 
    SET used_count = GREATEST(used_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.coupon_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for coupon usage tracking
CREATE TRIGGER track_coupon_usage
  AFTER INSERT OR DELETE ON order_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_usage();

-- Create updated_at trigger for coupons
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON discount_coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();