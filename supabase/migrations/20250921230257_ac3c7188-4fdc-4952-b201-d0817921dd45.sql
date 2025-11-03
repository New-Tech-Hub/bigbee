-- Add foreign key constraint between product_reviews and profiles
-- First, let's add a foreign key from product_reviews.user_id to profiles.user_id
ALTER TABLE public.product_reviews 
ADD CONSTRAINT fk_product_reviews_user_profile 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE SET NULL;