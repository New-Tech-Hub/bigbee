-- Add manager role to role hierarchy
INSERT INTO public.role_hierarchy (role, can_manage_roles, permissions) VALUES
('manager', '{"customer"}', '{"view_products", "create_orders", "view_own_orders", "manage_products", "view_all_orders"}')
ON CONFLICT (role) DO NOTHING;

-- Fix order_items column names
ALTER TABLE public.order_items
RENAME COLUMN price TO unit_price;

ALTER TABLE public.order_items
RENAME COLUMN subtotal TO total_price;

-- Add state column to profiles
ALTER TABLE public.profiles
ADD COLUMN state TEXT;

-- Add currency column to orders
ALTER TABLE public.orders
ADD COLUMN currency TEXT DEFAULT 'NGN';

-- Add gallery column to products
ALTER TABLE public.products
ADD COLUMN gallery TEXT[];

-- Fix discount_coupons column names to match code expectations
ALTER TABLE public.discount_coupons
RENAME COLUMN min_purchase TO minimum_amount;

ALTER TABLE public.discount_coupons
RENAME COLUMN max_discount TO maximum_discount_amount;

ALTER TABLE public.discount_coupons
RENAME COLUMN usage_count TO used_count;

ALTER TABLE public.discount_coupons
RENAME COLUMN end_date TO expires_at;