import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import OptimizedImage from "@/components/OptimizedImage";

interface InstagramPost {
  id: string;
  image_url: string;
  caption: string;
  likes: number;
  comments: number;
  product_id?: string;
  product_name?: string;
  product_price?: number;
  permalink: string;
}

const InstagramFeed = () => {
  const { addToCart } = useCart();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock Instagram posts data - in production this would come from Instagram API
  const mockPosts: InstagramPost[] = [
    {
      id: "1",
      image_url: "/placeholder.svg",
      caption: "New arrivals from our premium collection! ✨ Perfect for any occasion. Shop now! #EbethBoutique #Fashion",
      likes: 245,
      comments: 18,
      product_id: "prod_1",
      product_name: "Premium Silk Dress",
      product_price: 85000,
      permalink: "https://www.instagram.com/ebeth_stores/"
    },
    {
      id: "3",
      image_url: "/placeholder.svg",
      caption: "Accessorize in style! These handcrafted jewelry pieces are flying off our shelves 💎 #Jewelry #Handcrafted",
      likes: 312,
      comments: 25,
      product_id: "prod_3",
      product_name: "Handcrafted Gold Necklace",
      product_price: 125000,
      permalink: "https://www.instagram.com/ebeth_stores/"
    },
    {
      id: "4",
      image_url: "/placeholder.svg",
      caption: "Weekend vibes with our casual collection! Comfort meets style 👗 #WeekendWear #Casual",
      likes: 156,
      comments: 8,
      product_id: "prod_4",
      product_name: "Casual Cotton Dress",
      product_price: 35000,
      permalink: "https://www.instagram.com/ebeth_stores/"
    },
    {
      id: "5",
      image_url: "/placeholder.svg",
      caption: "Behind the scenes at Ebeth Boutique! Our team curating the best products for you 📦 #BehindTheScenes",
      likes: 98,
      comments: 15,
      permalink: "https://www.instagram.com/ebeth_stores/"
    },
    {
      id: "6",
      image_url: "/placeholder.svg",
      caption: "Customer favorite! Our luxury bag collection is perfect for every occasion 👜 #LuxuryBags #Fashion",
      likes: 203,
      comments: 11,
      product_id: "prod_6",
      product_name: "Designer Handbag Collection",
      product_price: 45000,
      permalink: "https://www.instagram.com/ebeth_stores/"
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadPosts = async () => {
      setLoading(true);
      // In production, this would be an actual Instagram API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setLoading(false);
    };

    loadPosts();
  }, []);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const formatCaption = (caption: string, maxLength: number = 100) => {
    if (caption.length <= maxLength) return caption;
    return caption.substring(0, maxLength) + '...';
  };

  const handleShopNow = (productId: string) => {
    addToCart(productId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Follow Us on Instagram
          </h2>
          <p className="text-muted-foreground">
            Stay updated with our latest products and behind-the-scenes content
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Follow Us on Instagram
        </h2>
        <p className="text-muted-foreground mb-4">
          Stay updated with our latest products and behind-the-scenes content
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.open('https://www.instagram.com/ebeth_stores/', '_blank')}
          className="mb-8"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          @ebeth_stores
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-elegant transition-smooth">
            <div className="relative">
              <OptimizedImage
                src={post.image_url}
                alt="Instagram post"
                className="w-full aspect-square object-cover"
                width={400}
                height={400}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33.33vw"
              />
              {post.product_id && (
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                  Shoppable
                </Badge>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formatCaption(post.caption)}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(post.permalink, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>

              {post.product_id && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{post.product_name}</p>
                      <p className="text-gold font-semibold">
                        {formatCurrency(post.product_price!)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleShopNow(post.product_id!)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Shop Now
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Button 
          variant="outline"
          onClick={() => window.open('https://www.instagram.com/ebeth_stores/', '_blank')}
        >
          View More on Instagram
        </Button>
      </div>
    </div>
  );
};

export default InstagramFeed;