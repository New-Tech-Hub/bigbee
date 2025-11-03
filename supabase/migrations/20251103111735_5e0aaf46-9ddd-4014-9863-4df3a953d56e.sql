-- Add parent_id to categories for subcategories
ALTER TABLE public.categories
ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add missing columns to orders
ALTER TABLE public.orders
ADD COLUMN delivery_instructions TEXT,
ADD COLUMN tracking_number TEXT;

-- Rename coupons to discount_coupons
ALTER TABLE public.coupons RENAME TO discount_coupons;

-- Create security_audit_log table
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit log
CREATE POLICY "Admins can view security audit log"
ON public.security_audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Create store_settings table
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Store settings viewable by everyone
CREATE POLICY "Store settings are viewable by everyone"
ON public.store_settings FOR SELECT
USING (true);

-- Only admins can modify store settings
CREATE POLICY "Admins can insert store settings"
ON public.store_settings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update store settings"
ON public.store_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete store settings"
ON public.store_settings FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Insert default store settings
INSERT INTO public.store_settings (setting_key, setting_value, setting_type, description) VALUES
('store_name', 'Ebeth Boutique & Exclusive Store', 'text', 'Store name'),
('store_email', 'info@ebethboutique.com', 'text', 'Store contact email'),
('store_phone', '+234 XXX XXX XXXX', 'text', 'Store phone number'),
('store_address', 'Lagos, Nigeria', 'text', 'Store physical address'),
('currency', 'NGN', 'text', 'Default currency'),
('tax_rate', '7.5', 'number', 'Default tax rate percentage'),
('shipping_fee', '2000', 'number', 'Default shipping fee'),
('free_shipping_threshold', '50000', 'number', 'Minimum order for free shipping');

-- Add trigger for store_settings
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX idx_security_audit_log_table_name ON public.security_audit_log(table_name);

-- Update app_role enum to include manager
ALTER TYPE public.app_role ADD VALUE 'manager';