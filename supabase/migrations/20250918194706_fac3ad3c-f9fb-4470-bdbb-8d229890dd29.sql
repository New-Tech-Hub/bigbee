-- Add new traveling bags to the bags & luggage category
INSERT INTO products (
  name, 
  description, 
  price, 
  currency, 
  category_id, 
  slug, 
  image_url, 
  is_active, 
  featured,
  stock_quantity
) VALUES 
-- Aluminum Hard Shell Suitcase Set
(
  'Premium Aluminum Hard Shell Suitcase Set',
  'Professional aluminum hard shell suitcase set with 360-degree spinner wheels. Features TSA locks, durable aluminum frame, and spacious interior. Perfect for business travel and vacation. Available in multiple sizes.',
  320000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'premium-aluminum-suitcase-set',
  '/src/assets/aluminum-suitcase-set.jpg',
  true,
  true,
  15
),
-- Large Aluminum Suitcase
(
  'Large Aluminum Spinner Suitcase',
  'Extra large aluminum hard shell suitcase with 4-wheel spinner system. Features reinforced corners, TSA-approved locks, and telescopic handle. Ideal for extended trips and international travel.',
  185000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'large-aluminum-spinner-suitcase',
  '/src/assets/aluminum-suitcase-set.jpg',
  true,
  false,
  20
),
-- Medium Aluminum Suitcase
(
  'Medium Aluminum Travel Suitcase',
  'Medium-sized aluminum hard shell suitcase with premium spinner wheels. Lightweight yet durable construction with multiple compartments. Perfect for week-long trips and carry-on size compliance.',
  145000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'medium-aluminum-travel-suitcase',
  '/src/assets/aluminum-suitcase-set.jpg',
  true,
  false,
  25
),
-- Olive Luxury Luggage Set
(
  'Olive Luxury Soft Luggage Set',
  'Premium 3-piece soft luggage set in elegant olive color. Features high-quality fabric construction, smooth-rolling wheels, and expandable compartments. Includes large suitcase, medium suitcase, and carry-on bag.',
  275000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'olive-luxury-soft-luggage-set',
  '/src/assets/olive-luggage-set.jpg',
  true,
  true,
  12
),
-- Large Olive Suitcase
(
  'Large Olive Soft Shell Suitcase',
  'Large soft shell suitcase in sophisticated olive green. Features durable fabric exterior, multiple pockets, and smooth 4-wheel system. Expandable design provides extra packing space when needed.',
  165000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'large-olive-soft-shell-suitcase',
  '/src/assets/olive-luggage-set.jpg',
  true,
  false,
  18
),
-- Medium Olive Suitcase
(
  'Medium Olive Travel Bag',
  'Medium-sized olive travel bag with premium soft shell construction. Lightweight design with reinforced corners and comfortable handles. Perfect for business trips and weekend getaways.',
  125000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'medium-olive-travel-bag',
  '/src/assets/olive-luggage-set.jpg',
  true,
  false,
  22
),
-- Carry-on Olive Bag
(
  'Olive Carry-On Travel Bag',
  'Compact carry-on travel bag in stylish olive color. Features multiple compartments, padded laptop section, and comfortable shoulder straps. Airline-compliant size for overhead storage.',
  85000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'olive-carry-on-travel-bag',
  '/src/assets/olive-luggage-set.jpg',
  true,
  false,
  30
),
-- Bessie Green Handbag (from first image)
(
  'Bessie Designer Green Handbag',
  'Elegant green designer handbag with premium leather finish. Features structured design, metal hardware, and spacious interior. Perfect for daily use and special occasions.',
  78000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'bessie-designer-green-handbag',
  '/src/assets/designer-handbags-collection.jpg',
  true,
  false,
  25
),
-- Orange Textured Handbag
(
  'Orange Premium Textured Handbag',
  'Luxurious orange textured handbag with sophisticated ribbed design. Features premium handles, spacious interior, and elegant styling. Perfect for adding a pop of color to any outfit.',
  92000,
  'NGN',
  'a4690a22-c9d7-460a-bf44-a0938121ef4a',
  'orange-premium-textured-handbag',
  '/src/assets/designer-handbags-collection.jpg',
  true,
  false,
  20
);