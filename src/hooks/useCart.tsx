import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to cart",
        description: "Item added to your cart successfully."
      });
      
      return true;
    } catch (error) {
      // Error handled by toast - no console logging in production
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { addToCart };
};