-- Reorganize categories according to the new structure
-- First, let's get the existing category IDs we need to work with

-- Create new major categories if they don't exist
INSERT INTO categories (name, slug, parent_id, display_order, is_active)
VALUES 
  ('Fashion & Clothing', 'fashion-clothing', NULL, 1, true),
  ('Beauty & Personal Care', 'beauty-personal-care', NULL, 2, true),
  ('Bags & Luggage', 'bags-luggage', NULL, 3, true),
  ('Home & Living', 'home-living', NULL, 4, true),
  ('Food & Beverages', 'food-beverages', NULL, 5, true),
  ('Premium Collections', 'premium-collections', NULL, 6, true)
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- Get the IDs for the major categories
DO $$
DECLARE
  fashion_id uuid;
  beauty_id uuid;
  bags_id uuid;
  home_id uuid;
  food_id uuid;
  premium_id uuid;
  mens_wear_id uuid;
  womens_wear_id uuid;
  accessories_id uuid;
BEGIN
  -- Get major category IDs
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion-clothing' AND parent_id IS NULL;
  SELECT id INTO beauty_id FROM categories WHERE slug = 'beauty-personal-care' AND parent_id IS NULL;
  SELECT id INTO bags_id FROM categories WHERE slug = 'bags-luggage' AND parent_id IS NULL;
  SELECT id INTO home_id FROM categories WHERE slug = 'home-living' AND parent_id IS NULL;
  SELECT id INTO food_id FROM categories WHERE slug = 'food-beverages' AND parent_id IS NULL;
  SELECT id INTO premium_id FROM categories WHERE slug = 'premium-collections' AND parent_id IS NULL;

  -- Fashion & Clothing subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Men''s Wear', 'mens-wear', fashion_id, 1, true),
    ('Women''s Wear', 'womens-wear', fashion_id, 2, true),
    ('Accessories', 'accessories-fashion', fashion_id, 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Get subcategory IDs for nested categories
  SELECT id INTO mens_wear_id FROM categories WHERE slug = 'mens-wear';
  SELECT id INTO womens_wear_id FROM categories WHERE slug = 'womens-wear';
  SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories-fashion';

  -- Men's Wear sub-subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Formal Wear', 'formal-wear', mens_wear_id, 1, true),
    ('Men''s Executive Shoes', 'mens-executive-shoes', mens_wear_id, 2, true),
    ('Men''s Bags & Briefcases', 'mens-bags', mens_wear_id, 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Women's Wear sub-subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Dresses', 'dresses', womens_wear_id, 1, true),
    ('Make Up Kits', 'makeup-kits', womens_wear_id, 2, true),
    ('Jewelry', 'jewelry', womens_wear_id, 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Accessories sub-subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Sunglasses', 'sunglasses', accessories_id, 1, true),
    ('Watches', 'watches', accessories_id, 2, true),
    ('Belts', 'belts', accessories_id, 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Beauty & Personal Care subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Skincare', 'skincare', beauty_id, 1, true),
    ('Haircare', 'haircare', beauty_id, 2, true),
    ('Perfumes', 'perfumes', beauty_id, 3, true),
    ('Makeup', 'makeup', beauty_id, 4, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Bags & Luggage subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Suitcases', 'suitcases', bags_id, 1, true),
    ('Travel Bags', 'travel-bags', bags_id, 2, true),
    ('Handbags', 'handbags', bags_id, 3, true),
    ('Backpacks', 'backpacks', bags_id, 4, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Home & Living subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Kitchen Essentials', 'kitchen-essentials', home_id, 1, true),
    ('Furniture', 'furniture', home_id, 2, true),
    ('Decor', 'decor', home_id, 3, true),
    ('Cleaning Supplies', 'cleaning-supplies', home_id, 4, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Food & Beverages subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Beverages', 'beverages', food_id, 1, true),
    ('Packaged Food', 'packaged-food', food_id, 2, true),
    ('Snacks', 'snacks', food_id, 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Premium Collections subcategories
  INSERT INTO categories (name, slug, parent_id, display_order, is_active)
  VALUES 
    ('Luxury Items', 'luxury-items', premium_id, 1, true),
    ('Limited Editions', 'limited-editions', premium_id, 2, true),
    ('Gift Sets', 'gift-sets', premium_id, 3, true)
  ON CONFLICT (slug) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    display_order = EXCLUDED.display_order;

  -- Deactivate old categories that are no longer needed as major categories
  UPDATE categories 
  SET is_active = false 
  WHERE slug IN (
    'specials',
    'jewelries',
    'make-up-kits',
    'premium-luggage',
    'sports-fitness',
    'womens-executive-shoes',
    'womens-handbags'
  ) AND parent_id IS NULL;

END $$;