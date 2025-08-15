-- The auth.config table doesn't exist, so we'll skip the OTP expiry fix for now
-- The is_admin_user function has been properly updated with search_path

-- Let's create the updated_at trigger for profiles table if it doesn't exist
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for inquiries table if it doesn't exist  
CREATE TRIGGER IF NOT EXISTS update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();