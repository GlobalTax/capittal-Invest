import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export async function uploadCompanyLogo(
  file: File,
  companySlug: string
): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 5MB');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be an image (JPG, PNG, WebP, or SVG)');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${companySlug}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('company-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('company-logos')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteCompanyLogo(logoUrl: string): Promise<void> {
  if (!logoUrl) return;

  try {
    // Extract filename from URL
    const urlParts = logoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete from storage
    const { error } = await supabase.storage
      .from('company-logos')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete logo:', error);
    throw error;
  }
}

export async function replaceCompanyLogo(
  oldLogoUrl: string | null,
  newFile: File,
  companySlug: string
): Promise<string> {
  // Delete old logo if exists
  if (oldLogoUrl) {
    try {
      await deleteCompanyLogo(oldLogoUrl);
    } catch (error) {
      console.warn('Could not delete old logo:', error);
    }
  }

  // Upload new logo
  return uploadCompanyLogo(newFile, companySlug);
}
