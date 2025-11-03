import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import ProductReviews from "@/components/ProductReviews";
import { useWishlist } from "@/hooks/useWishlist";
import { useAnalytics } from "@/hooks/useAnalytics";
import SEOHead from "@/components/SEOHead";
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ProductDetail = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist();
  const { trackProductView, trackAddToCart, trackWishlistAdd } = useAnalytics();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in production this would come from the database
  const product = {
    id: productId || "1",
    name: "Premium Cotton Blend Dress",
    category: "Women's Fashion",
    price: 45000,
    originalPrice: 55000,
    currency: "NGN",
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    stockQuantity: 15,
    description: "Elegant and comfortable dress made from premium cotton blend fabric. Perfect for both casual and formal occasions. Features include breathable material, flattering fit, and high-quality construction.",
    features: [
      "Premium cotton blend fabric",
      "Machine washable",
      "Breathable and comfortable",
      "Available in multiple sizes",
      "Flattering design"
    ],
    images: [
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600",
      "/api/placeholder/600/600"
    ],
    specifications: {
      "Material": "65% Cotton, 35% Polyester",
      "Care": "Machine wash cold, tumble dry low",
      "Origin": "Made in Nigeria",
      "Sizes": "XS, S, M, L, XL, XXL"
    }
  };

  useEffect(() => {
    if (product) {
      trackProductView(product.id, product.name, 'Fashion');
    }
  }, [product, trackProductView]);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success && product) {
      trackAddToCart(product.id, product.name, quantity, product.price);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      const wishlistItemId = getWishlistItemId(product.id);
      if (wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      }
    } else {
      const success = await addToWishlist(product.id);
      if (success) {
        trackWishlistAdd(product.id, product.name);
      }
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      <SEOHead
        title={product?.name || 'Product Details'}
        description={product?.description || 'Premium fashion and accessories at Ebeth Boutique'}
        keywords={`${product?.name}, fashion, boutique, ${product?.category || 'accessories'}`}
        canonicalUrl={`https://ebethboutique.com/product/${productId}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product?.name,
          "description": product?.description,
          "brand": {
            "@type": "Brand",
            "name": "Ebeth Boutique"
          },
          "offers": {
            "@type": "Offer",
            "price": product?.price,
            "priceCurrency": "NGN",
            "availability": product?.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/clothing">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImage === index ? 'border-gold' : 'border-muted'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWishlistToggle}
                    className={isInWishlist(product.id) ? "text-red-500" : ""}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {renderStars(product.rating)}
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-gold">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice > product.price && (
                    <Badge variant="destructive">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Features</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-muted-foreground text-sm flex items-center">
                      <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.stockQuantity} available)
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.inStock ? `Add to Cart - ${formatCurrency(product.price * quantity)}` : 'Out of Stock'}
                </Button>
              </div>

              <Separator />

              {/* Specifications */}
              <div>
                <h3 className="font-semibold mb-4">Specifications</h3>
                <Card className="p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <ProductReviews productId={product.id} />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;