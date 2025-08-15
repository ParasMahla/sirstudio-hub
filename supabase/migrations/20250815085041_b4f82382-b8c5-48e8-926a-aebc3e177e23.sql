-- First, create a function to check if user is admin (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated users can view all inquiries" ON public.inquiries;  
DROP POLICY IF EXISTS "Authenticated users can update inquiries" ON public.inquiries;

-- Allow anonymous users to insert inquiries (for public contact form)
CREATE POLICY "Anyone can insert inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admin users can view inquiries (protect customer data)
CREATE POLICY "Admin users can view inquiries"
ON public.inquiries  
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- Only admin users can update inquiries
CREATE POLICY "Admin users can update inquiries"
ON public.inquiries
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Make message column nullable since it's optional in the form
ALTER TABLE public.inquiries ALTER COLUMN message DROP NOT NULL;