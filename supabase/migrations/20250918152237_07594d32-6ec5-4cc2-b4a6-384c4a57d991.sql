-- Add sample categories to help users get started
INSERT INTO public.categories (name, slug, description, image_url, is_active) VALUES
  ('Fashion & Clothing', 'fashion-clothing', 'Trendy clothing and fashion accessories for all occasions', '', true),
  ('Electronics & Gadgets', 'electronics-gadgets', 'Latest electronics and tech gadgets', '', true),
  ('Home & Living', 'home-living', 'Home decor, furniture, and living essentials', '', true),
  ('Beauty & Personal Care', 'beauty-personal-care', 'Cosmetics, skincare, and personal care products', '', true),
  ('Sports & Fitness', 'sports-fitness', 'Sports equipment and fitness accessories', '', true)
ON CONFLICT (slug) DO NOTHING;

-- Add sample products to help demonstrate the functionality
INSERT INTO public.products (name, slug, description, price, stock_quantity, image_url, category_id, is_active) 
SELECT 
  'Sample ' || c.name || ' Product',
  'sample-' || c.slug || '-product',
  'This is a sample product for the ' || c.name || ' category to help demonstrate the functionality.',
  99.99,
  10,
  'https://via.placeholder.com/400x400?text=' || REPLACE(c.name, ' ', '+'),
  c.id,
  true
FROM public.categories c
WHERE c.is_active = true
ON CONFLICT (slug) DO NOTHING;