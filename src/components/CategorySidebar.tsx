import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  product_count?: number;
}

const CategorySidebar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Use basic query with manual product count for better TypeScript compatibility
      const { data: basicData, error: basicError } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('is_active', true)
        .order('name');

      if (basicError) throw basicError;
      
      // Get product counts for each category in parallel
      const categoriesWithCounts = await Promise.all(
        (basicData || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);
          
          return {
            ...category,
            product_count: count || 0
          };
        })
      );
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      // Silently fail - categories are supplementary
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="w-64 bg-card rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Categories
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </aside>
    );
  }

  const currentCategory = location.pathname.split('/').pop();

  return (
    <aside className="w-64 bg-card rounded-lg border p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Categories
      </h2>
      
      <nav className="space-y-2">
        <Link to="/">
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            className="w-full justify-between"
            size="sm"
          >
            <span>All Products</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
        
        {categories.map((category) => (
          <Link key={category.id} to={`/products/${category.slug}`}>
            <Button
              variant={currentCategory === category.slug ? 'default' : 'ghost'}
              className="w-full justify-between"
              size="sm"
            >
              <span className="truncate">{category.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {category.product_count}
                </Badge>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </Link>
        ))}
      </nav>
      
      {categories.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-4">
          No categories available
        </p>
      )}
    </aside>
  );
};

export default CategorySidebar;