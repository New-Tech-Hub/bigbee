-- ==========================================
-- FINAL RLS POLICY HARDENING
-- ==========================================

-- 1. FIX CART_ITEMS POLICIES - Split ALL policy into specific policies with WITH CHECK
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;

CREATE POLICY "Users can view their own cart"
ON public.cart_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart"
ON public.cart_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON public.cart_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
ON public.cart_items
FOR DELETE
USING (auth.uid() = user_id);


-- 2. FIX WISHLIST_ITEMS POLICIES - Split ALL policy into specific policies with WITH CHECK
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist_items;

CREATE POLICY "Users can view their own wishlist"
ON public.wishlist_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlist_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist"
ON public.wishlist_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
ON public.wishlist_items
FOR DELETE
USING (auth.uid() = user_id);


-- 3. ADD EXPLICIT DELETE POLICY FOR ORDERS
-- Only super admins can delete orders (for compliance/legal reasons)
CREATE POLICY "Super admin can delete orders"
ON public.orders
FOR DELETE
USING (public.is_super_admin(auth.uid()));


-- 4. ADD CART VALIDATION TRIGGER
CREATE OR REPLACE FUNCTION public.validate_cart_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user_id matches authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify cart items for other users';
  END IF;
  
  -- Validate quantity is positive
  IF NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Cart item quantity must be positive';
  END IF;
  
  -- Validate quantity doesn't exceed reasonable limits
  IF NEW.quantity > 999 THEN
    RAISE EXCEPTION 'Cart item quantity exceeds maximum limit';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_cart_item_trigger ON public.cart_items;

CREATE TRIGGER validate_cart_item_trigger
BEFORE INSERT OR UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_cart_item();


-- 5. ADD WISHLIST VALIDATION TRIGGER
CREATE OR REPLACE FUNCTION public.validate_wishlist_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user_id matches authenticated user
  IF NEW.user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify wishlist items for other users';
  END IF;
  
  -- Prevent duplicate wishlist items
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (
      SELECT 1 FROM public.wishlist_items
      WHERE user_id = NEW.user_id
      AND product_id = NEW.product_id
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Product already in wishlist';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_wishlist_item_trigger ON public.wishlist_items;

CREATE TRIGGER validate_wishlist_item_trigger
BEFORE INSERT OR UPDATE ON public.wishlist_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_wishlist_item();