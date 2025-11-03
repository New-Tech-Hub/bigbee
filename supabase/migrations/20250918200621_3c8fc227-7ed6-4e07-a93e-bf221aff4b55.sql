-- Fix broken image URLs for products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/src/assets/designer-handbags-collection.jpg';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/src/assets/aluminum-suitcase-set.jpg';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/src/assets/olive-luggage-set.jpg';

-- Fix placeholder URLs with proper images
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1578736641330-5d14cb4c4bbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/api/placeholder/400/300' AND category_id IN (SELECT id FROM categories WHERE name = 'Beverages');
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/api/placeholder/400/300' AND category_id IN (SELECT id FROM categories WHERE name = 'Fashion & Clothing');
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/api/placeholder/400/300' AND category_id IN (SELECT id FROM categories WHERE name = 'Food & Beverages');
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' WHERE image_url = '/api/placeholder/400/300' AND category_id IN (SELECT id FROM categories WHERE name = 'Make Up Kits');