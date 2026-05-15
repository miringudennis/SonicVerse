-- Migration to track unread group messages
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS last_read_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP;
