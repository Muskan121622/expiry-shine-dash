-- FreshGuard Database Setup
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS donations ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'medicine', 'cosmetic', 'other')),
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'soon-expiring', 'expired')),
  image_url TEXT,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  days_until_expiry INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  donated_by TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for donations (more open for community sharing)
CREATE POLICY "Anyone can view available donations" ON donations
  FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can create donations" ON donations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Donation creators can update their donations" ON donations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = donations.product_id 
      AND products.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_donations_product_id ON donations(product_id);
CREATE INDEX IF NOT EXISTS idx_donations_available ON donations(is_available);

-- Create function to automatically update days_until_expiry
CREATE OR REPLACE FUNCTION update_days_until_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.days_until_expiry := (NEW.expiry_date - CURRENT_DATE);
  
  -- Update status based on days until expiry
  IF NEW.days_until_expiry < 0 THEN
    NEW.status := 'expired';
  ELSIF NEW.days_until_expiry <= 7 THEN
    NEW.status := 'soon-expiring';
  ELSE
    NEW.status := 'active';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_days_until_expiry ON products;
CREATE TRIGGER trigger_update_days_until_expiry
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_days_until_expiry();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
DROP TRIGGER IF EXISTS trigger_update_donations_updated_at ON donations;
CREATE TRIGGER trigger_update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();