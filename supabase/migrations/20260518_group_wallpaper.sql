-- Migration to add wallpaper_url to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS wallpaper_url text;
