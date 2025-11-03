-- Update groceries category to makeup kits
UPDATE categories 
SET 
  name = 'Make Up Kits',
  slug = 'make-up-kits',
  description = 'Professional makeup kits and beauty essentials for all occasions',
  image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
WHERE slug = 'groceries';

-- Update products in groceries category to makeup products
UPDATE products 
SET 
  name = 'Professional Makeup Kit - Complete Set',
  description = 'Complete professional makeup kit with eyeshadows, foundation, lipsticks, and brushes',
  price = 45000,
  image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  slug = 'professional-makeup-kit-complete'
WHERE name = 'Fresh Organic Apples';

UPDATE products 
SET 
  name = 'Bridal Makeup Kit - Luxury Collection',
  description = 'Premium bridal makeup kit with long-lasting foundation, elegant eyeshadows, and glossy lipsticks',
  price = 75000,
  image_url = 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  slug = 'bridal-makeup-kit-luxury'
WHERE name = 'Premium Olive Oil';

UPDATE products 
SET 
  name = 'Everyday Makeup Essentials Kit',
  description = 'Perfect starter kit with everyday makeup essentials - foundation, mascara, lipstick, and blush',
  price = 25000,
  image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  slug = 'everyday-makeup-essentials'
WHERE name = 'Artisan Cheese Selection';

UPDATE products 
SET 
  name = 'Travel Makeup Kit - Compact Size',
  description = 'Compact travel-friendly makeup kit with mini sizes of all your beauty essentials',
  price = 18000,
  image_url = 'https://images.unsplash.com/photo-1631730486887-4d4ac2d4de0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  slug = 'travel-makeup-kit-compact'
WHERE name = 'Whole Grain Bread';

UPDATE products 
SET 
  name = 'Party Glam Makeup Kit',
  description = 'Glamorous makeup kit perfect for parties and special events with bold colors and shimmer',
  price = 35000,
  image_url = 'https://images.unsplash.com/photo-1583241800710-4c334b7bf466?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  slug = 'party-glam-makeup-kit'
WHERE name = 'Premium Red Wine';

-- Add more makeup products to fill the category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Natural Glow Makeup Kit',
  'Achieve a natural, dewy look with this organic makeup kit featuring earth-tone colors',
  28000,
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'natural-glow-makeup-kit',
  c.id,
  50,
  true,
  'NGN'
FROM categories c 
WHERE c.slug = 'make-up-kits';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Bold & Beautiful Makeup Collection',
  'Make a statement with this bold makeup collection featuring vibrant colors and high-impact looks',
  42000,
  'https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bold-beautiful-makeup-collection',
  c.id,
  30,
  true,
  'NGN'
FROM categories c 
WHERE c.slug = 'make-up-kits';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Teen Starter Makeup Kit',
  'Perfect first makeup kit for teenagers with gentle, age-appropriate products and tutorials',
  15000,
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'teen-starter-makeup-kit',
  c.id,
  75,
  true,
  'NGN'
FROM categories c 
WHERE c.slug = 'make-up-kits';