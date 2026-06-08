CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL, -- Removed UNIQUE here
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- This handles the uniqueness rule for the whole table
ALTER TABLE ONLY public.users 
    ADD CONSTRAINT users_email_key UNIQUE (email);
