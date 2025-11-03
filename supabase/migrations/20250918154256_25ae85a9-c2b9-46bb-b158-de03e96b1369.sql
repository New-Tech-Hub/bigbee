-- Create optimized function to get categories with product counts
CREATE OR REPLACE FUNCTION get_categories_with_product_count()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  image_url text,
  product_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    COALESCE(COUNT(p.id), 0) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_active_name ON categories(is_active, name);