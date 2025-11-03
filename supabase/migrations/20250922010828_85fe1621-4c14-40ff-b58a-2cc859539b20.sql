-- Get the user ID for jerryguma01@gmail.com
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'jerryguma01@gmail.com';
    
    -- Check if user exists
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email jerryguma01@gmail.com not found';
    END IF;
    
    -- Insert or update the profile to make them admin
    INSERT INTO public.profiles (user_id, full_name, role, country)
    VALUES (target_user_id, 'Jerry Guma', 'admin', 'Nigeria')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'admin',
        full_name = COALESCE(profiles.full_name, 'Jerry Guma'),
        country = COALESCE(profiles.country, 'Nigeria'),
        updated_at = now();
        
    RAISE NOTICE 'Successfully set jerryguma01@gmail.com as super admin';
END $$;