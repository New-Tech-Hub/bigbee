import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/OptimizedImage";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  currency: string;
  slug: string;
  categories?: {
    name: string;
    slug: string;
  };
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (query.trim().length >= 2) {
      searchProducts();
    } else {
      setProducts([]);
      setTotalProducts(0);
      setLoading(false);
    }
  }, [query]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      // Search products by name and description
      const { data: products, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          currency,
          slug,
          categories (
            name,
            slug
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true);

      if (productError) throw productError;

      // Also search for products by category name
      const { data: categoryProducts, error: categoryError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          currency,
          slug,
          categories!inner (
            name,
            slug
          )
        `)
        .ilike('categories.name', `%${query}%`)
        .eq('is_active', true);

      if (categoryError) throw categoryError;

      // Combine and deduplicate results
      const allResults = [...(products || []), ...(categoryProducts || [])];
      const uniqueResults = allResults.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );

      setProducts(uniqueResults);
      setTotalProducts(uniqueResults.length);
    } catch (error) {
      // Search error handled by loading state
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Searching Products"
          description="Search for premium products at Ebeth Boutique"
          noIndex={true}
        />
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={query ? `Search: "${query}" - Find Products` : 'Search Products'}
        description={query ? `Search results for "${query}" at Ebeth Boutique. Discover ${totalProducts} premium products matching your search.` : 'Search for premium products at Ebeth Boutique & Exclusive Store'}
        noIndex={true}
        structuredData={totalProducts > 0 ? {
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          "name": `Search Results for "${query}"`,
          "url": `https://ebeth-boutique.lovable.app/search?q=${encodeURIComponent(query)}`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalProducts,
            "itemListElement": products.slice(0, 5).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.image_url,
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": product.currency
                }
              }
            }))
          }
        } : undefined}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {query ? `Search Results for "${query}"` : 'Search Products'}
          </h1>
          {query && (
            <p className="text-muted-foreground">
              Found {totalProducts} product{totalProducts !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {!query || query.trim().length < 2 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Enter at least 2 characters to search for products
            </p>
          </div>
        ) : totalProducts === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No products found for "{query}"
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or browse our categories
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-muted">
                      {product.image_url ? (
                        <OptimizedImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={300}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {product.categories?.name || 'Uncategorized'}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        <span className="text-xs text-muted-foreground">4.5</span>
                      </div>
                    </div>
                    
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-gold transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-gold">
                        {formatCurrency(product.price, product.currency)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="shrink-0"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;