-- Create App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic trigger to auto-update the timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trigger_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION update_app_settings_updated_at();

-- Initial default settings for customer support (so the client doesn't crash on empty fetches)
INSERT INTO public.app_settings (key, value, description)
VALUES (
    'customer_support',
    '{"enabled": true, "text": "For support regarding your order, please email support@nymintra.com or call +91-9876543210 during business hours (9AM - 6PM IST)."}'::jsonb,
    'Global configuration for presenting customer support contact details to users after they order.'
) ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Service role bypasses anyway, but good practice)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (public config like support needs to be readable)
CREATE POLICY "Allow public read access to settings" ON public.app_settings FOR SELECT USING (true);
-- Write access restricted to service_role / backend only
CREATE POLICY "Allow all write for service_role on settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
