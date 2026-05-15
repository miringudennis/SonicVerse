-- Migration to support media types and group management

-- Add media_type to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'text';

-- Add media_url and media_type to group_messages
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'document'));

-- Function to track seen posts (simplified for this task)
-- We can add a last_seen_at timestamp to the follows table
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP;
