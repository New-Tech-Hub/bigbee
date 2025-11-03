-- Delete existing placeholder products
DELETE FROM products WHERE description LIKE '%sample product%' OR name LIKE 'Sample%';

-- Add luxury watches to Accessories category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency, featured)
SELECT 
  'Luxury Gold Chain Watch',
  'Premium gold-plated chain watch with crystal detailing and elegant design',
  125000,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'luxury-gold-chain-watch',
  c.id,
  15,
  true,
  'NGN',
  true
FROM categories c WHERE c.slug = 'accessories';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Diamond Studded Silver Watch',
  'Elegant silver watch with diamond accents and stainless steel band',
  89000,
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'diamond-studded-silver-watch',
  c.id,
  20,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'accessories';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Classic Leather Strap Watch',
  'Timeless watch with genuine leather strap and crystal face',
  45000,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'classic-leather-strap-watch',
  c.id,
  25,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'accessories';

-- Add men's formal shoes to Formal Wear category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency, featured)
SELECT 
  'Premium Leather Oxford Shoes',
  'Handcrafted genuine leather oxford shoes perfect for business and formal occasions',
  75000,
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'premium-leather-oxford-shoes',
  c.id,
  30,
  true,
  'NGN',
  true
FROM categories c WHERE c.slug = 'formal-wear';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Italian Leather Loafers',
  'Sophisticated Italian leather loafers with elegant design and comfortable fit',
  65000,
  'https://images.unsplash.com/photo-1582897085656-c636d006a246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'italian-leather-loafers',
  c.id,
  25,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'formal-wear';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Classic Black Dress Shoes',
  'Traditional black dress shoes made from premium leather for professional settings',
  55000,
  'https://images.unsplash.com/photo-1614252369475-531eba835eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'classic-black-dress-shoes',
  c.id,
  35,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'formal-wear';

-- Add handbags to Bags & Luggage category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency, featured)
SELECT 
  'Designer Heart Pattern Handbag',
  'Stylish handbag with heart pattern design and premium hardware finish',
  95000,
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'designer-heart-pattern-handbag',
  c.id,
  20,
  true,
  'NGN',
  true
FROM categories c WHERE c.slug = 'bags-luggage';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Luxury Textured Leather Bag',
  'Premium textured leather handbag with sophisticated design and multiple compartments',
  125000,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'luxury-textured-leather-bag',
  c.id,
  15,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'bags-luggage';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Travel Suitcase Set - Red',
  'Durable hardshell travel suitcase set with spinner wheels and TSA lock',
  185000,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'travel-suitcase-set-red',
  c.id,
  10,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'bags-luggage';

-- Add bedding sets to Home & Living category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency, featured)
SELECT 
  'Floral Duvet Cover Set',
  'Beautiful floral patterned duvet cover set with matching pillowcases',
  35000,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'floral-duvet-cover-set',
  c.id,
  40,
  true,
  'NGN',
  true
FROM categories c WHERE c.slug = 'home-living';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Premium Bedding Collection',
  'Luxury bedding set with elegant patterns and premium cotton material',
  42000,
  'https://images.unsplash.com/photo-1540513789378-3b2afa9d9b8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'premium-bedding-collection',
  c.id,
  30,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'home-living';

-- Add dinnerware to Home & Living category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Gold Rim Ceramic Dinner Set',
  'Elegant ceramic dinner set with gold rim detailing, perfect for special occasions',
  55000,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'gold-rim-ceramic-dinner-set',
  c.id,
  25,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'home-living';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Fine China Bowl Collection',
  'Set of elegant fine china bowls with delicate patterns and premium finish',
  38000,
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'fine-china-bowl-collection',
  c.id,
  20,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'home-living';

-- Add men's slippers to Accessories category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Luxury Leather Slippers',
  'Premium leather slippers with comfortable sole and elegant design',
  28000,
  'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'luxury-leather-slippers',
  c.id,
  50,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'accessories';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Woven Pattern Sandals',
  'Stylish sandals with woven pattern design and comfortable straps',
  22000,
  'https://images.unsplash.com/photo-1506629905607-84d5d8d8a63f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'woven-pattern-sandals',
  c.id,
  45,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'accessories';

-- Add makeup products to Make Up Kits category
INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency, featured)
SELECT 
  'King Davis Professional Makeup Set',
  'Complete professional makeup collection with eyeshadows, lipsticks, and beauty tools',
  75000,
  'https://images.unsplash.com/photo-1631730486887-4d4ac2d4de0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'king-davis-professional-makeup-set',
  c.id,
  25,
  true,
  'NGN',
  true
FROM categories c WHERE c.slug = 'make-up-kits';

INSERT INTO products (name, description, price, image_url, slug, category_id, stock_quantity, is_active, currency)
SELECT 
  'Premium Cosmetics Collection',
  'High-quality cosmetics set with various shades and professional grade products',
  65000,
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'premium-cosmetics-collection',
  c.id,
  30,
  true,
  'NGN'
FROM categories c WHERE c.slug = 'make-up-kits';