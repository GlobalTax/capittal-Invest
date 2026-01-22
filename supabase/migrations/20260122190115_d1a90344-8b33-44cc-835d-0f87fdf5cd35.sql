-- Add video_url column to home_content table for Hero video background
ALTER TABLE home_content 
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN home_content.video_url IS 'URL del video de fondo para el Hero';