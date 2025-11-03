import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import OptimizedImage from "@/components/OptimizedImage";

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemoveFromWishlist = async (itemId: string) => {
    await removeFromWishlist(itemId);
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <>
        <SEOHead
          title="My Wishlist"
          description="View and manage your wishlist items at Ebeth Boutique."
        />
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-16">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading wishlist...</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="My Wishlist - Saved Items & Favorites"
        description="View and manage your saved items at Ebeth Boutique. Never lose track of products you love."
        keywords="wishlist, saved items, favorites, shopping list, Ebeth Boutique"
        canonicalUrl="https://ebeth-boutique.lovable.app/wishlist"
        noIndex={true}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-gold/20 rounded-full">
                <Heart className="h-6 w-6 text-gold" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                My Wishlist
              </h1>
            </div>

            {wishlistItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Your Wishlist is Empty</h3>
                <p className="text-muted-foreground mb-6">
                  Save items you love to your wishlist and never lose track of them again.
                </p>
                <Link to="/">
                  <Button>Start Shopping</Button>
                </Link>
              </Card>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistItems.map((item) => (
                    <Card key={item.id} className="group overflow-hidden hover:shadow-elegant transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden">
                        {item.products?.image_url && (
                          <OptimizedImage
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            width={300}
                            height={300}
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        )}
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {item.products?.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-lg font-bold text-gold">
                            {formatCurrency(item.products?.price || 0, item.products?.currency)}
                          </p>
                          <Badge 
                            variant={(item.products?.stock_quantity || 0) > 0 ? "default" : "destructive"} 
                            className="text-xs"
                          >
                            {(item.products?.stock_quantity || 0) > 0 
                              ? `${item.products?.stock_quantity} in stock` 
                              : 'Out of stock'
                            }
                          </Badge>
                        </div>

                        <div className="flex space-x-2">
                          <Link 
                            to={`/product/${item.products?.slug}`}
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            disabled={(item.products?.stock_quantity || 0) === 0}
                            onClick={() => handleAddToCart(item.product_id)}
                            className="flex-1"
                          >
                            {(item.products?.stock_quantity || 0) > 0 ? (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add to Cart
                              </>
                            ) : (
                              'Out of Stock'
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Wishlist;