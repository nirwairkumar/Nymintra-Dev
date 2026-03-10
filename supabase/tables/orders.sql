-- Create Customizations Table
CREATE TABLE IF NOT EXISTS public.customizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    bride_name VARCHAR(255),
    groom_name VARCHAR(255),
    event_date DATE,
    venue TEXT,
    extra_notes TEXT,
    print_color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Status Enum Type
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'printing', 'packing', 'shipping', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    design_slug VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 100,
    total_amount DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    customization_id UUID REFERENCES public.customizations(id) ON DELETE SET NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Trigger to update updated_at on orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Enable RLS (Optional, can be fully disabled depending on setup)
-- Right now our backend interacts with Service Role Key, so it bypasses RLS anyway.
-- Keeping RLS off or allowing all access for simplicity unless instructed:
ALTER TABLE public.customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for Customizations
CREATE POLICY "Allow all for service_role on customizations" ON public.customizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their own customizations" ON public.customizations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Addresses
CREATE POLICY "Allow all for service_role on addresses" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for Orders
CREATE POLICY "Allow all for service_role on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
