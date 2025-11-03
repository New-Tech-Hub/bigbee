-- Fix broken beverage images and change Electronics to Jewelries

-- Update beverages with working image URLs
UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE name = 'Premium Water (Pack of 12)';

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE name = 'Energy Drink Collection';

-- Change Electronics & Gadgets category to Jewelries
UPDATE categories 
SET name = 'Jewelries', 
    slug = 'jewelries',
    description = 'Exquisite jewelry collection including gold, watches, necklaces, and accessories'
WHERE slug = 'electronics-gadgets';

-- Add jewelry products to the converted category
INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured)
SELECT 
  'Gold Chain Necklace', 'gold-chain-necklace', 'Elegant 18k gold chain necklace perfect for any occasion', 85000, 
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  id, 15, true, true
FROM categories WHERE slug = 'jewelries';

INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured)
SELECT 
  'Diamond Stud Earrings', 'diamond-stud-earrings', 'Classic diamond stud earrings with brilliant cut stones', 120000,
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  id, 8, true, true
FROM categories WHERE slug = 'jewelries';

INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured)
SELECT 
  'Luxury Watch Collection', 'luxury-watch-collection', 'Premium Swiss-made watches for the discerning collector', 250000,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  id, 5, true, true
FROM categories WHERE slug = 'jewelries';

INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured)
SELECT 
  'Ruby Pendant Necklace', 'ruby-pendant-necklace', 'Stunning ruby pendant on delicate gold chain', 95000,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  id, 12, true, false
FROM categories WHERE slug = 'jewelries';

INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured)
SELECT 
  'Wedding Ring Set', 'wedding-ring-set', 'Beautiful matching wedding ring set in white gold', 180000,
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  id, 6, true, false
FROM categories WHERE slug = 'jewelries';

INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured)
SELECT 
  'Pearl Drop Earrings', 'pearl-drop-earrings', 'Elegant freshwater pearl drop earrings', 45000,
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  id, 20, true, false
FROM categories WHERE slug = 'jewelries';