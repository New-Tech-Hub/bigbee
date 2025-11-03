import { useParams } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Heart, ShoppingCart, Filter, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import CustomerCare from "@/components/CustomerCare";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/OptimizedImage";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  gallery: any; // Change from any[] to any to match Json type
  stock_quantity: number;
  is_active: boolean;
  category_id: string;
  categories?: {
    name: string;
    slug: string;
  };
}

const Products = () => {
  const { category } = useParams();
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist();
  const { toast } = useToast();
  
  // Get category from URL params or pathname for legacy routes
  const getCategorySlug = () => {
    if (category) return category;
    
    const pathname = window.location.pathname;
    // Legacy routes
    if (pathname === '/specials') return 'specials';
    if (pathname === '/clothing') return 'clothing';
    if (pathname === '/accessories') return 'accessories';
    if (pathname === '/groceries') return 'groceries';
    if (pathname === '/household') return 'household';
    
    // Current category routes - extract slug from pathname
    if (pathname.startsWith('/')) {
      const slug = pathname.slice(1); // Remove leading slash
      // Check if this matches a known category slug format
      if (slug.includes('-') || ['formal-wear', 'bags-luggage', 'beauty-personal-care', 'beverages', 'jewelries', 'fashion-clothing', 'food-beverages', 'make-up-kits', 'home-living', 'sports-fitness', 'mens-executive-shoes', 'womens-executive-shoes', 'mens-bags', 'womens-handbags', 'premium-luggage'].includes(slug)) {
        return slug;
      }
    }
    
    return null;
  };
  
  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    fetchProducts(true);
  }, [category, window.location.pathname, sortBy]);

  const fetchProducts = async (reset = false) => {
    const categorySlug = getCategorySlug();
    
    // If no category, fetch all products
    const pageToFetch = reset ? 1 : currentPage;
    setLoading(true);
    
    try {
      if (!categorySlug) {
        // Fetch all products if no category specified
        let query = supabase
          .from('products')
          .select('*, categories(name, slug)', { count: 'exact' })
          .eq('is_active', true);

        // Apply sorting
        if (sortBy === 'price-low') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price-high') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'name') {
          query = query.order('name', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data: productsData, error: productsError, count } = await query
          .range((pageToFetch - 1) * PRODUCTS_PER_PAGE, pageToFetch * PRODUCTS_PER_PAGE - 1);

        if (productsError) throw productsError;

        setProducts(reset ? productsData || [] : [...products, ...(productsData || [])]);
        setTotalProducts(count || 0);
        setHasMore((productsData?.length || 0) === PRODUCTS_PER_PAGE);
        setCategoryInfo({ name: 'All Products', description: 'Browse our complete collection' });
        setLoading(false);
        return;
      }
      
      // Fetching category data
      
      // Single optimized query combining category and products
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .maybeSingle();

      // Category data loaded

      if (categoryError) throw categoryError;

      if (!categoryData) {
        // Category not found
        setCategoryInfo(null);
        setProducts([]);
        setTotalProducts(0);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setCategoryInfo(categoryData);

      // Check if this is a major category with subcategories
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryData.id)
        .eq('is_active', true);

      // Build category IDs to fetch products from
      const categoryIds = [categoryData.id];
      if (subcategories && subcategories.length > 0) {
        categoryIds.push(...subcategories.map(sub => sub.id));
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .in('category_id', categoryIds)
        .eq('is_active', true);

      setTotalProducts(count || 0);

      // Get paginated products with optimized fields and sorting
      const from = (pageToFetch - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          description,
          image_url,
          gallery,
          stock_quantity,
          is_active,
          category_id,
          created_at,
          categories!inner (
            name,
            slug
          )
        `)
        .in('category_id', categoryIds)
        .eq('is_active', true);

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data: productsData, error: productsError } = await query.range(from, to);

      if (productsError) throw productsError;

      const newProducts = (productsData || []).map(product => ({
        ...product,
        gallery: product.gallery || []
      }));
      
      if (reset) {
        setProducts(newProducts);
        setCurrentPage(1);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE && (from + newProducts.length) < (count || 0));
      
    } catch (error) {
      // Product fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
      fetchProducts(false);
    }
  };

  const getCategoryTitle = () => {
    return categoryInfo?.name || "Products";
  };

  const toggleLike = async (productId: string) => {
    if (isInWishlist(productId)) {
      const wishlistItemId = getWishlistItemId(productId);
      if (wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      }
    } else {
      await addToWishlist(productId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Loading Products"
          description="Browse premium products at Ebeth Boutique & Exclusive Store"
        />
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!getCategorySlug() || !categoryInfo) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Category Not Found"
          description="The category you're looking for doesn't exist at Ebeth Boutique"
          noIndex={true}
        />
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
            <Link to="/">
              <Button className="mt-4">Return Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title={`${getCategoryTitle()} - Ebeth Boutique`}
          description={categoryInfo.description || `Shop ${getCategoryTitle().toLowerCase()} at Ebeth Boutique`}
        />
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{getCategoryTitle()}</h1>
            <p className="text-muted-foreground mb-8">{categoryInfo.description}</p>
            <div className="bg-muted rounded-lg p-8">
              <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
              <p className="text-muted-foreground">This category doesn't have any products yet. Check back soon!</p>
              <Link to="/">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${getCategoryTitle()} - Premium Quality Products`}
        description={categoryInfo.description || `Shop ${getCategoryTitle().toLowerCase()} at Ebeth Boutique. Premium quality products with exclusive deals in Nigeria.`}
        keywords={`${getCategoryTitle()}, ${categoryInfo.slug}, ebeth boutique, atlantic mall abuja, nigeria shopping`}
        canonicalUrl={`https://ebeth-boutique.lovable.app/category/${categoryInfo.slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": getCategoryTitle(),
          "description": categoryInfo.description,
          "url": `https://ebeth-boutique.lovable.app/category/${categoryInfo.slug}`,
          "numberOfItems": totalProducts,
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": products.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "image": product.image_url,
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "NGN",
                  "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              }
            }))
          }
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {getCategoryTitle()}
            </h1>
            <p className="text-muted-foreground text-lg">
              {categoryInfo.description || `Discover our curated collection of premium ${categoryInfo.name?.toLowerCase()}`}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-muted-foreground">
              Showing {products.length} of {totalProducts} products
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-0 shadow-card hover:shadow-elegant transition-smooth">
                <div className="relative">
                  <OptimizedImage
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-smooth"
                    width={300}
                    height={256}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  <button
                    onClick={() => toggleLike(product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-smooth"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        likedItems.includes(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {product.categories?.name || 'Uncategorized'}
                  </Badge>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        ₦{Number(product.price).toLocaleString()}
                      </span>
                    </div>
                    <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"} className="text-xs">
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/product/${product.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(product.id, 1)}
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && products.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={loadMore} 
                disabled={loading}
                className="px-8"
              >
                {loading ? "Loading..." : "Load More Products"}
              </Button>
            </div>
          )}
        </main>
        
        <Footer />
        <CustomerCare />
      </div>
    </>
  );
};

export default Products;