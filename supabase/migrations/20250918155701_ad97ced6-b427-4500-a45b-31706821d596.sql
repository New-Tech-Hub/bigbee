-- Add missing categories
INSERT INTO categories (name, slug, description, is_active) VALUES
('Groceries', 'groceries', 'Fresh groceries and everyday essentials', true),
('Specials', 'specials', 'Special offers and discounted items', true),
('Food & Beverages', 'food-beverages', 'Delicious food items and refreshing beverages', true)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for inserting products
DO $$ 
DECLARE 
    groceries_id uuid;
    specials_id uuid;
    food_beverages_id uuid;
    beverages_id uuid;
    fashion_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO groceries_id FROM categories WHERE slug = 'groceries';
    SELECT id INTO specials_id FROM categories WHERE slug = 'specials';
    SELECT id INTO food_beverages_id FROM categories WHERE slug = 'food-beverages';
    SELECT id INTO beverages_id FROM categories WHERE slug = 'beverages';
    SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion-clothing';

    -- Insert sample products for Groceries
    INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured) VALUES
    ('Fresh Organic Tomatoes', 'fresh-organic-tomatoes', 'Premium quality organic tomatoes, perfect for cooking and salads', 2500, '/api/placeholder/400/300', groceries_id, 50, true, true),
    ('Premium Rice (5kg)', 'premium-rice-5kg', 'High-quality long grain rice, perfect for Nigerian dishes', 8500, '/api/placeholder/400/300', groceries_id, 30, true, false),
    ('Fresh Pepper Mix', 'fresh-pepper-mix', 'Spicy pepper mix including scotch bonnet and bell peppers', 1500, '/api/placeholder/400/300', groceries_id, 40, true, false),
    ('Plantain (Per Hand)', 'plantain-per-hand', 'Fresh green plantains, perfect for cooking', 1200, '/api/placeholder/400/300', groceries_id, 60, true, false),
    ('Palm Oil (1 Liter)', 'palm-oil-1-liter', 'Pure red palm oil for authentic Nigerian cooking', 3500, '/api/placeholder/400/300', groceries_id, 25, true, true);

    -- Insert sample products for Specials
    INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured) VALUES
    ('Designer Handbag - 50% Off', 'designer-handbag-special', 'Limited time offer on premium designer handbags', 45000, '/api/placeholder/400/300', specials_id, 10, true, true),
    ('Electronics Bundle Deal', 'electronics-bundle-deal', 'Smartphone + Headphones combo at special price', 125000, '/api/placeholder/400/300', specials_id, 5, true, true),
    ('Fashion Week Special', 'fashion-week-special', 'Trendy outfits at discounted prices', 35000, '/api/placeholder/400/300', specials_id, 15, true, false),
    ('Beauty Care Package', 'beauty-care-package', 'Complete skincare routine bundle', 28000, '/api/placeholder/400/300', specials_id, 20, true, false);

    -- Insert sample products for Food & Beverages
    INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured) VALUES
    ('Artisan Coffee Beans', 'artisan-coffee-beans', 'Premium roasted coffee beans from local farms', 4500, '/api/placeholder/400/300', food_beverages_id, 35, true, false),
    ('Organic Fruit Juice', 'organic-fruit-juice', 'Fresh squeezed organic fruit juice blend', 2800, '/api/placeholder/400/300', food_beverages_id, 45, true, true),
    ('Traditional Spice Mix', 'traditional-spice-mix', 'Authentic Nigerian spice blend for cooking', 1800, '/api/placeholder/400/300', food_beverages_id, 50, true, false);

    -- Add more products to existing categories
    IF beverages_id IS NOT NULL THEN
        INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured) VALUES
        ('Premium Water (Pack of 12)', 'premium-water-pack', 'Pure filtered water in convenient pack', 3200, '/api/placeholder/400/300', beverages_id, 40, true, false),
        ('Energy Drink Collection', 'energy-drink-collection', 'Assorted energy drinks for active lifestyle', 5500, '/api/placeholder/400/300', beverages_id, 25, true, true);
    END IF;

    IF fashion_id IS NOT NULL THEN
        INSERT INTO products (name, slug, description, price, image_url, category_id, stock_quantity, is_active, featured) VALUES
        ('Trendy Summer Dress', 'trendy-summer-dress', 'Light and comfortable dress perfect for warm weather', 18500, '/api/placeholder/400/300', fashion_id, 20, true, true),
        ('Classic Denim Jeans', 'classic-denim-jeans', 'High-quality denim jeans in various sizes', 25000, '/api/placeholder/400/300', fashion_id, 30, true, false),
        ('Designer T-Shirt Collection', 'designer-tshirt-collection', 'Premium cotton t-shirts with unique designs', 12500, '/api/placeholder/400/300', fashion_id, 45, true, false);
    END IF;
END $$;