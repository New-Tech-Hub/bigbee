import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryProducts from "@/components/CategoryProducts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import OptimizedImage from "@/components/OptimizedImage";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

const CategoryView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  const fetchCategoryData = async () => {
    try {
      // Fetch main category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (categoryError) throw categoryError;
      
      if (!categoryData) {
        toast({
          title: "Category Not Found",
          description: "The requested category does not exist.",
          variant: "destructive"
        });
        return;
      }

      setCategory(categoryData);

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .eq('parent_id', categoryData.id)
        .eq('is_active', true)
        .order('display_order')
        .order('name');

      if (subcategoriesError) throw subcategoriesError;
      setSubcategories(subcategoriesData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load category data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Category - Ebeth Boutique</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-16">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Helmet>
          <title>Category Not Found - Ebeth Boutique</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
              <p className="text-muted-foreground">
                The category you're looking for doesn't exist.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} - Ebeth Boutique & Exclusive Store</title>
        <meta name="description" content={category.description || `Shop ${category.name} at Ebeth Boutique`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Category Hero */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
            <OptimizedImage
              src={category.image_url || '/placeholder.svg'}
              alt={category.name}
              className="w-full h-full object-cover"
              width={1200}
              height={384}
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-white/90 text-lg max-w-2xl">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subcategories.map((subcategory) => (
                  <Link 
                    key={subcategory.id}
                    to={`/category/${subcategory.slug}`}
                  >
                    <Card className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <OptimizedImage
                          src={subcategory.image_url || '/placeholder.svg'}
                          alt={subcategory.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          width={200}
                          height={200}
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.67vw"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-center text-sm line-clamp-2">
                          {subcategory.name}
                        </h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main Category Products */}
          <CategoryProducts 
            categoryId={category.id} 
            categoryName={subcategories.length > 0 ? "Featured Products" : "All Products"}
            limit={12}
          />

          {/* Subcategory Products */}
          {subcategories.map((subcategory) => (
            <CategoryProducts 
              key={subcategory.id}
              categoryId={subcategory.id} 
              categoryName={subcategory.name}
              limit={8}
            />
          ))}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CategoryView;