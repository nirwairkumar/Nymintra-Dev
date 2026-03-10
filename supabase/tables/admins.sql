-- Create Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Admins must be created first in Supabase Auth (Email/Password).
-- Then, insert their email into this 'admins' table to grant them dashboard access.

-- Create Trigger to update updated_at on admins
CREATE OR REPLACE FUNCTION update_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_admins_updated_at ON public.admins;
CREATE TRIGGER trigger_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION update_admins_updated_at();

-- Disable RLS for admins since Backend Service Key bypasses it anyway 
-- and frontend should never read from this directly.
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
