-- Create role management system using existing text roles

-- Create role hierarchy table to define permissions (using text instead of enum)
CREATE TABLE IF NOT EXISTS public.role_hierarchy (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role text NOT NULL,
    can_manage_roles text[] DEFAULT '{}',
    permissions jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(role)
);

-- Insert role hierarchy data
INSERT INTO public.role_hierarchy (role, can_manage_roles, permissions) VALUES
('super_admin', ARRAY['admin', 'manager', 'customer'], '{"all": true, "can_create_admins": true, "can_delete_users": true, "full_system_access": true}'),
('admin', ARRAY['manager', 'customer'], '{"manage_products": true, "manage_orders": true, "manage_users": true, "view_analytics": true}'),
('manager', ARRAY['customer'], '{"manage_products": true, "manage_orders": true, "view_users": true}'),
('customer', ARRAY[]::text[], '{"view_products": true, "place_orders": true, "manage_profile": true}')
ON CONFLICT (role) DO UPDATE SET
    can_manage_roles = EXCLUDED.can_manage_roles,
    permissions = EXCLUDED.permissions,
    updated_at = now();

-- Enable RLS on role hierarchy
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;

-- Policy for role hierarchy viewing
CREATE POLICY "Role hierarchy viewable by authenticated users" ON public.role_hierarchy
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create enhanced role checking functions
CREATE OR REPLACE FUNCTION public.can_manage_role(manager_user_id uuid, target_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.role_hierarchy rh ON p.role = rh.role
    WHERE p.user_id = manager_user_id 
    AND target_role = ANY(rh.can_manage_roles)
  );
$$;

-- Enhanced is_manager function
CREATE OR REPLACE FUNCTION public.is_manager(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = is_manager.user_id
    AND profiles.role IN ('manager', 'admin', 'super_admin')
  );
$$;

-- Enhanced admin check that includes super admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = is_admin_or_super.user_id
    AND profiles.role IN ('admin', 'super_admin')
  );
$$;

-- Update the role escalation prevention to use the new hierarchy system
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admin can change any role
  IF public.is_super_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- Check if the current user can manage the target role
  IF OLD.role != NEW.role AND NOT public.can_manage_role(auth.uid(), NEW.role) THEN
    RAISE EXCEPTION 'You do not have permission to assign the % role', NEW.role;
  END IF;
  
  -- Prevent users from changing their own role unless they're super admin
  IF OLD.user_id = auth.uid() AND OLD.role != NEW.role AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  
  RETURN NEW;
END;
$$;