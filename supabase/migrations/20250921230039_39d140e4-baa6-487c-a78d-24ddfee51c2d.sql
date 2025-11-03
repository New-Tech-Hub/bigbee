-- Fix security warnings by setting proper search_path on functions
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update product stock when order items are inserted
  UPDATE products 
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Check if stock goes below zero and alert
  IF (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product ID %', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION track_order_status_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only track if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, notes, created_by)
    VALUES (NEW.id, NEW.status, 'Status updated', auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$;