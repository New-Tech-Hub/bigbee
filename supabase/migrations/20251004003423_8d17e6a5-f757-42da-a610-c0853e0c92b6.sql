-- Add parent_id to categories table for hierarchy support
ALTER TABLE categories ADD COLUMN parent_id uuid REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN display_order integer DEFAULT 0;

-- Create index for better performance on hierarchy queries
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_active_parent ON categories(is_active, parent_id);

-- Add function to get category hierarchy
CREATE OR REPLACE FUNCTION get_category_path(category_id uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  path text[];
  current_id uuid;
  current_name text;
  parent_id uuid;
BEGIN
  current_id := category_id;
  path := ARRAY[]::text[];
  
  WHILE current_id IS NOT NULL LOOP
    SELECT name, categories.parent_id INTO current_name, parent_id
    FROM categories
    WHERE id = current_id;
    
    IF current_name IS NULL THEN
      EXIT;
    END IF;
    
    path := array_prepend(current_name, path);
    current_id := parent_id;
  END LOOP;
  
  RETURN path;
END;
$$;

-- Function to get all subcategories of a category
CREATE OR REPLACE FUNCTION get_subcategories(parent_category_id uuid)
RETURNS TABLE(id uuid, name text, slug text, description text, image_url text, display_order integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.slug, c.description, c.image_url, c.display_order
  FROM categories c
  WHERE c.parent_id = parent_category_id
    AND c.is_active = true
  ORDER BY c.display_order, c.name;
END;
$$;

-- Function to get major categories (root level)
CREATE OR REPLACE FUNCTION get_major_categories()
RETURNS TABLE(id uuid, name text, slug text, description text, image_url text, display_order integer, subcategory_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, 
    c.name, 
    c.slug, 
    c.description, 
    c.image_url,
    c.display_order,
    COUNT(sub.id) as subcategory_count
  FROM categories c
  LEFT JOIN categories sub ON sub.parent_id = c.id AND sub.is_active = true
  WHERE c.parent_id IS NULL
    AND c.is_active = true
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.display_order
  ORDER BY c.display_order, c.name;
END;
$$;

-- Update existing categories to be major categories (set parent_id to NULL)
-- This ensures backward compatibility
UPDATE categories SET parent_id = NULL WHERE parent_id IS NOT NULL;