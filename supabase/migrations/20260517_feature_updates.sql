-- Migration for message replies, group images, and notification updates

-- Add reply_to_id to group_messages
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.group_messages(id) ON DELETE SET NULL;

-- Add image_url to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS image_url text;

-- Add status to notifications data if needed or just handle it in app logic
-- No schema change needed for notifications as it uses jsonb data
