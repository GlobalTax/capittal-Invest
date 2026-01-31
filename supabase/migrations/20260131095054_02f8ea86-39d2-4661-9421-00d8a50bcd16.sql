-- Add ken_burns_direction column to video_slides
ALTER TABLE public.video_slides 
ADD COLUMN IF NOT EXISTS ken_burns_direction TEXT DEFAULT 'right' 
CHECK (ken_burns_direction IN ('left', 'right', 'up', 'center'));

-- Update existing slides with varying directions
UPDATE public.video_slides SET ken_burns_direction = 'right' WHERE display_order = 1;
UPDATE public.video_slides SET ken_burns_direction = 'left' WHERE display_order = 2;
UPDATE public.video_slides SET ken_burns_direction = 'up' WHERE display_order = 3;
UPDATE public.video_slides SET ken_burns_direction = 'center' WHERE display_order = 4;
UPDATE public.video_slides SET ken_burns_direction = 'right' WHERE display_order = 5;