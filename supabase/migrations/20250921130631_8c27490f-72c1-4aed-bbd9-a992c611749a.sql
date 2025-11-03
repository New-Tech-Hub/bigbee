-- Create new categories for executive shoes and gender-specific bags
INSERT INTO categories (name, slug, description, image_url, is_active) VALUES
('Men''s Executive Shoes', 'mens-executive-shoes', 'Premium executive shoes for professional men', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop', true),
('Women''s Executive Shoes', 'womens-executive-shoes', 'Elegant executive shoes for professional women', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=600&fit=crop', true),
('Men''s Bags', 'mens-bags', 'Professional bags, briefcases, and accessories for men', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop', true),
('Women''s Handbags', 'womens-handbags', 'Elegant handbags, purses, and accessories for women', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop', true),
('Premium Luggage', 'premium-luggage', 'Premium traveling bags, suitcases, and luxury luggage sets', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop', true);

-- Add executive shoes for men
INSERT INTO products (name, slug, description, price, currency, image_url, category_id, stock_quantity, is_active, featured) VALUES
('Oxford Business Shoes - Black', 'oxford-business-shoes-black', 'Premium leather Oxford shoes perfect for business meetings and formal occasions', 45000, 'NGN', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-executive-shoes'), 25, true, true),
('Derby Executive Shoes - Brown', 'derby-executive-shoes-brown', 'Handcrafted brown leather Derby shoes for the modern executive', 52000, 'NGN', 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-executive-shoes'), 20, true, false),
('Loafers Professional - Black', 'loafers-professional-black', 'Sophisticated leather loafers for professional settings', 38000, 'NGN', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-executive-shoes'), 30, true, false),
('Brogues Executive - Tan', 'brogues-executive-tan', 'Classic tan brogues with intricate detailing for executives', 48000, 'NGN', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-executive-shoes'), 15, true, false);

-- Add executive shoes for women
INSERT INTO products (name, slug, description, price, currency, image_url, category_id, stock_quantity, is_active, featured) VALUES
('Women''s Executive Pumps - Black', 'womens-executive-pumps-black', 'Elegant black leather pumps perfect for executive women', 42000, 'NGN', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-executive-shoes'), 28, true, true),
('Professional Heels - Navy', 'professional-heels-navy', 'Sophisticated navy blue heels for professional occasions', 39000, 'NGN', 'https://images.unsplash.com/photo-1596702960001-6b2d4d8e2d82?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-executive-shoes'), 22, true, false),
('Executive Flats - Brown', 'executive-flats-brown', 'Comfortable brown leather flats for executive women', 35000, 'NGN', 'https://images.unsplash.com/photo-1564298606-0daf40b2c5a8?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-executive-shoes'), 25, true, false),
('Corporate Ankle Boots - Black', 'corporate-ankle-boots-black', 'Stylish black ankle boots for corporate settings', 46000, 'NGN', 'https://images.unsplash.com/photo-1580066214607-11cf0e4a9a60?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-executive-shoes'), 18, true, false);

-- Add men's bags
INSERT INTO products (name, slug, description, price, currency, image_url, category_id, stock_quantity, is_active, featured) VALUES
('Executive Leather Briefcase', 'executive-leather-briefcase', 'Premium leather briefcase for business professionals', 75000, 'NGN', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-bags'), 15, true, true),
('Professional Laptop Bag', 'professional-laptop-bag', 'Sophisticated laptop bag with compartments for executives', 45000, 'NGN', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-bags'), 20, true, false),
('Business Travel Duffle', 'business-travel-duffle', 'Premium leather duffle bag for business travelers', 85000, 'NGN', 'https://images.unsplash.com/photo-1553581732-f9e5b9ca8dcb?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-bags'), 12, true, false),
('Executive Messenger Bag', 'executive-messenger-bag', 'Professional messenger bag in premium leather', 52000, 'NGN', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'mens-bags'), 18, true, false);

-- Add women's handbags
INSERT INTO products (name, slug, description, price, currency, image_url, category_id, stock_quantity, is_active, featured) VALUES
('Designer Tote Bag - Black', 'designer-tote-bag-black', 'Elegant black leather tote bag perfect for professional women', 55000, 'NGN', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-handbags'), 22, true, true),
('Executive Handbag - Brown', 'executive-handbag-brown', 'Sophisticated brown leather handbag for executives', 48000, 'NGN', 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-handbags'), 25, true, false),
('Professional Crossbody - Navy', 'professional-crossbody-navy', 'Stylish navy crossbody bag for professional occasions', 42000, 'NGN', 'https://images.unsplash.com/photo-1564298606-0daf40b2c5a8?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-handbags'), 28, true, false),
('Luxury Shoulder Bag - Red', 'luxury-shoulder-bag-red', 'Premium red leather shoulder bag for special occasions', 62000, 'NGN', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-handbags'), 15, true, false),
('Business Laptop Tote', 'business-laptop-tote', 'Professional tote bag with laptop compartment', 58000, 'NGN', 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'womens-handbags'), 20, true, false);

-- Add premium luggage based on reference images
INSERT INTO products (name, slug, description, price, currency, image_url, category_id, stock_quantity, is_active, featured) VALUES
('Aluminum Hardcase Luggage Set', 'aluminum-hardcase-luggage-set', 'Premium aluminum hardcase luggage set with 4 spinner wheels and TSA lock', 185000, 'NGN', 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'premium-luggage'), 8, true, true),
('Olive Premium Travel Set', 'olive-premium-travel-set', 'Luxury olive-colored travel luggage set with premium wheels and compartments', 165000, 'NGN', 'https://images.unsplash.com/photo-1588996094463-56fd7e1c0b6a?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'premium-luggage'), 10, true, false),
('Executive Red Luggage Set', 'executive-red-luggage-set', 'Professional red luggage set with organized compartments and smooth wheels', 175000, 'NGN', 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'premium-luggage'), 6, true, false),
('Silver Business Travel Case', 'silver-business-travel-case', 'High-quality silver aluminum travel case perfect for business trips', 95000, 'NGN', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'premium-luggage'), 12, true, false),
('Premium Carry-On Spinner', 'premium-carry-on-spinner', 'Lightweight premium carry-on with 360-degree spinner wheels', 78000, 'NGN', 'https://images.unsplash.com/photo-1565030279788-e3b8adf0f7b8?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'premium-luggage'), 15, true, false),
('Luxury Travel Organizer Set', 'luxury-travel-organizer-set', 'Complete travel organizer set with multiple compartments and premium materials', 125000, 'NGN', 'https://images.unsplash.com/photo-1565030279788-e3b8adf0f7b8?w=800&h=600&fit=crop', (SELECT id FROM categories WHERE slug = 'premium-luggage'), 10, true, false);