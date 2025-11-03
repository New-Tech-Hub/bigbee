-- Restructure categories for better organization under Luggage and Bags
-- Update existing category names for clarity
UPDATE categories SET 
  name = 'Men''s Bags & Briefcases',
  description = 'Professional briefcases, messenger bags, and business travel bags for men'
WHERE slug = 'mens-bags';

UPDATE categories SET 
  name = 'Women''s Handbags & Purses',  
  description = 'Elegant handbags, purses, totes, and professional bags for women'
WHERE slug = 'womens-handbags';

UPDATE categories SET
  name = 'Premium Travel Luggage',
  description = 'Luxury suitcases, travel sets, and premium luggage for all travelers'
WHERE slug = 'premium-luggage';

-- Keep the main Bags & Luggage category as an overview category
UPDATE categories SET
  description = 'Complete collection of bags, handbags, briefcases, and premium luggage for men and women'
WHERE slug = 'bags-luggage';

-- Add some organization categories for shoes
UPDATE categories SET
  name = 'Men''s Executive Shoes',
  description = 'Professional dress shoes, oxfords, loafers, and business footwear for men'
WHERE slug = 'mens-executive-shoes';

UPDATE categories SET  
  name = 'Women''s Executive Shoes',
  description = 'Professional heels, flats, pumps, and business footwear for women'
WHERE slug = 'womens-executive-shoes';