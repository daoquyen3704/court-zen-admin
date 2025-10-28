-- Create enum for court categories
CREATE TYPE court_category AS ENUM ('football', 'badminton', 'tennis', 'basketball', 'volleyball');

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'canceled', 'completed');

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create courts table
CREATE TABLE public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create maintenance blocks table
CREATE TABLE public.maintenance_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE NOT NULL,
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_blocks ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (true);

-- Courts policies (public read, admin write)
CREATE POLICY "Courts are viewable by everyone"
  ON public.courts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert courts"
  ON public.courts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update courts"
  ON public.courts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete courts"
  ON public.courts FOR DELETE
  TO authenticated
  USING (true);

-- Bookings policies
CREATE POLICY "Users can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (true);

-- Maintenance blocks policies
CREATE POLICY "Maintenance blocks are viewable by authenticated users"
  ON public.maintenance_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert maintenance blocks"
  ON public.maintenance_blocks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update maintenance blocks"
  ON public.maintenance_blocks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete maintenance blocks"
  ON public.maintenance_blocks FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.courts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.maintenance_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Bóng đá', 'football', 'Sân bóng đá 5-7-11 người', '⚽'),
  ('Cầu lông', 'badminton', 'Sân cầu lông tiêu chuẩn', '🏸'),
  ('Tennis', 'tennis', 'Sân tennis chuyên nghiệp', '🎾'),
  ('Bóng rổ', 'basketball', 'Sân bóng rổ full court', '🏀'),
  ('Bóng chuyền', 'volleyball', 'Sân bóng chuyền indoor/outdoor', '🏐');