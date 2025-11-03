-- Add missing columns to products table
ALTER TABLE public.products
ADD COLUMN currency TEXT DEFAULT 'NGN',
ADD COLUMN stock_quantity INTEGER DEFAULT 0;

-- Update delivery_slots table to match expected structure
ALTER TABLE public.delivery_slots
RENAME COLUMN slot_date TO date;

ALTER TABLE public.delivery_slots
ADD COLUMN start_time TEXT,
ADD COLUMN end_time TEXT,
ADD COLUMN max_orders INTEGER DEFAULT 10,
ADD COLUMN current_orders INTEGER DEFAULT 0;

-- Update slot_time to be computed or drop it if not needed
ALTER TABLE public.delivery_slots DROP COLUMN slot_time;

-- Rename wishlists to wishlist_items
ALTER TABLE public.wishlists RENAME TO wishlist_items;

-- Add total_amount column to orders
ALTER TABLE public.orders
RENAME COLUMN total TO total_amount;

-- Create user_roles table for admin functionality
CREATE TYPE public.app_role AS ENUM ('customer', 'admin', 'super_admin');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Create analytics_events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Analytics events can be inserted by anyone
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics"
ON public.analytics_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Create role_hierarchy table
CREATE TABLE public.role_hierarchy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role public.app_role NOT NULL UNIQUE,
  can_manage_roles public.app_role[],
  permissions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;

-- Insert default role hierarchy
INSERT INTO public.role_hierarchy (role, can_manage_roles, permissions) VALUES
('customer', '{}', '{"view_products", "create_orders", "view_own_orders"}'),
('admin', '{"customer"}', '{"view_products", "create_orders", "view_own_orders", "manage_products", "view_all_orders", "manage_categories"}'),
('super_admin', '{"customer", "admin"}', '{"view_products", "create_orders", "view_own_orders", "manage_products", "view_all_orders", "manage_categories", "manage_users", "manage_roles"}');

-- RLS for role_hierarchy - viewable by authenticated users
CREATE POLICY "Authenticated users can view role hierarchy"
ON public.role_hierarchy FOR SELECT
TO authenticated
USING (true);

-- Create function to get customer count
CREATE OR REPLACE FUNCTION public.get_customer_count()
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM auth.users;
$$;

-- Create indexes for analytics
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Update policies for admin management of products and categories
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Update trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_hierarchy_updated_at
BEFORE UPDATE ON public.role_hierarchy
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();