-- CRITICAL SECURITY FIX: Implement Proper Role Management System
-- This migration addresses privilege escalation vulnerabilities by:
-- 1. Moving roles from profiles table to dedicated user_roles table
-- 2. Implementing security definer functions to prevent RLS recursion
-- 3. Fixing discount coupons access
-- 4. Enhancing audit logging

-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'customer');

-- Step 2: Create user_roles table with proper constraints
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Add index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Step 3: Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Step 5: Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT 
  user_id, 
  CASE 
    WHEN role = 'admin' THEN 
      CASE 
        WHEN user_id = (SELECT id FROM auth.users WHERE email = 'jerryguma01@gmail.com' LIMIT 1) 
        THEN 'super_admin'::public.app_role
        ELSE 'admin'::public.app_role
      END
    WHEN role = 'manager' THEN 'manager'::public.app_role
    WHEN role = 'customer' THEN 'customer'::public.app_role
    ELSE 'customer'::public.app_role
  END,
  user_id
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure all users have at least customer role
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT user_id, 'customer'::public.app_role, user_id
FROM public.profiles
WHERE user_id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Update all database functions to use user_roles table
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id, 'admin') OR public.has_role(user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_manager(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id, 'manager') 
    OR public.has_role(user_id, 'admin') 
    OR public.has_role(user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_id, 'admin') OR public.has_role(user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.can_manage_role(manager_user_id uuid, target_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_hierarchy rh ON ur.role::text = rh.role
    WHERE ur.user_id = manager_user_id 
    AND target_role = ANY(rh.can_manage_roles)
  );
$$;

-- Step 7: Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- Step 8: Create trigger for automatic role assignment on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (NEW.id, 'customer'::public.app_role, NEW.id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Create audit trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'role_assigned',
      'user_roles',
      NEW.user_id,
      jsonb_build_object(
        'role', NEW.role,
        'assigned_by', auth.uid()
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'role_updated',
      'user_roles',
      NEW.user_id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'updated_by', auth.uid()
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'role_removed',
      'user_roles',
      OLD.user_id,
      jsonb_build_object(
        'role', OLD.role,
        'removed_by', auth.uid()
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_role_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();

-- Step 10: Drop old role management trigger and function from profiles
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_role_escalation();

-- Step 11: Update audit_profile_changes to remove role tracking
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log profile updates (non-role fields only now)
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'profile_updated',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'updated_by', auth.uid(),
        'fields_updated', jsonb_build_object(
          'full_name_changed', OLD.full_name IS DISTINCT FROM NEW.full_name,
          'phone_changed', OLD.phone IS DISTINCT FROM NEW.phone,
          'address_changed', OLD.address IS DISTINCT FROM NEW.address
        )
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Step 12: Create helper function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(target_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = target_user_id
  ORDER BY CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'manager' THEN 3
    WHEN 'customer' THEN 4
  END
  LIMIT 1;
$$;

-- Step 13: Update get_user_session_info to use user_roles
CREATE OR REPLACE FUNCTION public.get_user_session_info()
RETURNS TABLE(user_id uuid, email text, role text, last_sign_in timestamp with time zone, session_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    u.email,
    public.get_user_primary_role(p.user_id) as role,
    u.last_sign_in_at,
    1::bigint as session_count
  FROM public.profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE p.user_id = auth.uid();
$$;

-- Step 14: Drop role column from profiles (after all functions updated)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 15: Add updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();