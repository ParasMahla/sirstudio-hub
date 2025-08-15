-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Fix OTP expiry security issue by setting it to 1 hour (3600 seconds) for production
UPDATE auth.config 
SET value = '3600' 
WHERE parameter = 'OTP_EXPIRY';