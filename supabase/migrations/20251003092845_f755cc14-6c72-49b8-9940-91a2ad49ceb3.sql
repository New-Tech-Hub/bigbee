-- Update Beauty & Personal Care product images to use public URLs
UPDATE products 
SET image_url = '/products/professional-makeup-collection.jpg'
WHERE slug = 'professional-makeup-collection';

UPDATE products 
SET image_url = '/products/luxury-skincare-collection.jpg'
WHERE slug = 'luxury-skincare-collection';

UPDATE products 
SET image_url = '/products/designer-perfume-collection.jpg'
WHERE slug = 'designer-perfume-collection';

UPDATE products 
SET image_url = '/products/premium-hair-care-set.jpg'
WHERE slug = 'premium-hair-care-set';

UPDATE products 
SET image_url = '/products/anti-aging-skincare-set.jpg'
WHERE slug = 'anti-aging-skincare-set';

UPDATE products 
SET image_url = '/products/nail-care-collection.jpg'
WHERE slug = 'nail-care-collection';

UPDATE products 
SET image_url = '/products/spa-collection-set.jpg'
WHERE slug = 'spa-collection-set';

UPDATE products 
SET image_url = '/products/professional-brush-set.jpg'
WHERE slug = 'professional-brush-set';

-- Update luggage product images to use public URLs
UPDATE products 
SET image_url = '/products/red-hardshell-luggage.jpg'
WHERE slug = 'executive-hard-shell-luggage-set-cardinal-red';

UPDATE products 
SET image_url = '/products/yellow-hardshell-luggage.jpg'
WHERE slug = 'premium-hard-shell-luggage-set-golden-yellow';

UPDATE products 
SET image_url = '/products/colorful-luggage-collection.jpg'
WHERE slug = 'premium-travel-luggage-collection-multi-color';

UPDATE products 
SET image_url = '/products/black-professional-luggage.jpg'
WHERE slug IN ('professional-business-luggage-set-black', 'professional-carry-on-luggage-black');