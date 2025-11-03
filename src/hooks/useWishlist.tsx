import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products?: {
    name: string;
    price: number;
    image_url: string;
    currency: string;
    stock_quantity: number;
    slug: string;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user]);

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products (
            name,
            price,
            image_url,
            currency,
            stock_quantity,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      // Silently fail - wishlist errors shouldn't block user experience
      toast({
        title: "Error",
        description: "Failed to load wishlist items.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist.",
            variant: "default"
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Added to wishlist",
        description: "Item added to your wishlist successfully."
      });
      
      await fetchWishlistItems();
      return true;
    } catch (error) {
      // Error handled by toast
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist."
      });
      
      await fetchWishlistItems();
      return true;
    } catch (error) {
      // Error handled by toast
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive"
      });
      return false;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const getWishlistItemId = (productId: string) => {
    const item = wishlistItems.find(item => item.product_id === productId);
    return item?.id || null;
  };

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItemId,
    refreshWishlist: fetchWishlistItems
  };
};