-- Table: public.card_designs

CREATE TABLE IF NOT EXISTS public.card_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    categories JSONB NOT NULL DEFAULT '[]'::jsonb, -- New multi-category support
    category VARCHAR(50) NOT NULL DEFAULT 'uncategorized', -- Legacy column for backwards compatibility
    style VARCHAR(50),
    description TEXT,
    original_price DOUBLE PRECISION, -- MSRP
    base_price DOUBLE PRECISION NOT NULL, -- Price per card (Selling Price)
    min_quantity INTEGER DEFAULT 50, -- Minimum purchase
    thumbnail_url TEXT NOT NULL,
    image_urls JSONB DEFAULT '[]'::jsonb, -- Multi-image support
    preview_url TEXT,
    print_url TEXT,
    zones_json JSONB DEFAULT '{}'::jsonb, -- Defaulted for backwards compatibility
    supported_langs JSONB DEFAULT '["en"]'::jsonb,
    orientation VARCHAR(20) DEFAULT 'portrait',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    available_stock INTEGER DEFAULT 1000, -- Total cards available
    print_price NUMERIC DEFAULT 0, -- Cost of printing
    print_price_unit INTEGER DEFAULT 100, -- Units for print price (e.g. per 100)
    print_colors JSONB DEFAULT '[]'::jsonb, -- Array of available colors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.card_designs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public select" ON public.card_designs FOR SELECT USING (true);
CREATE POLICY "Allow all for service_role" ON public.card_designs FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_card_designs_slug ON public.card_designs(slug);
CREATE INDEX IF NOT EXISTS idx_card_designs_category ON public.card_designs(category);
CREATE INDEX IF NOT EXISTS idx_card_designs_is_active ON public.card_designs(is_active);
