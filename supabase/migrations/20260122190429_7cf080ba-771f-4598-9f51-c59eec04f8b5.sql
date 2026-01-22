-- Add poster image URL column for video fallback
ALTER TABLE home_content 
ADD COLUMN IF NOT EXISTS poster_image_url TEXT;

COMMENT ON COLUMN home_content.poster_image_url IS 'URL de la imagen poster/fallback mientras carga el video del Hero';