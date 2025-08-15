-- Create triggers without IF NOT EXISTS since PostgreSQL doesn't support it for triggers
-- Drop triggers first if they exist, then recreate them

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for inquiries table  
CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();