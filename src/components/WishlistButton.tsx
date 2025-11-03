import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface WishlistButtonProps {
  productId: string;
  size?: "sm" | "lg" | "default" | "icon";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

const WishlistButton = ({ 
  productId, 
  size = "sm", 
  variant = "ghost", 
  className = "" 
}: WishlistButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemId } = useWishlist();

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    if (isInWishlist(productId)) {
      const wishlistItemId = getWishlistItemId(productId);
      if (wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      }
    } else {
      await addToWishlist(productId);
    }
  };

  const isLiked = isInWishlist(productId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWishlistToggle}
      className={`${
        isLiked ? 'text-red-500' : 'text-muted-foreground'
      } hover:text-red-500 ${className}`}
    >
      <Heart 
        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} 
      />
    </Button>
  );
};

export default WishlistButton;