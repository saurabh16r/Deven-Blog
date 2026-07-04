import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary only if credentials exist
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadImage(fileUri: string, folder: string = 'founderbrief'): Promise<string> {
  if (!isConfigured) {
    throw new Error('Cloudinary credentials are not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }
  
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
}

export async function uploadAudio(fileUri: string): Promise<{ secure_url: string; duration: number; public_id: string }> {
  if (!isConfigured) {
    throw new Error('Cloudinary credentials are not configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }
  
  try {
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'founderbrief/audio',
      resource_type: 'video',
    });
    return {
      secure_url: result.secure_url,
      duration: result.duration || 0,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary audio upload error:', error);
    throw error;
  }
}

export async function deleteAudio(publicId: string): Promise<void> {
  if (!isConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });
  } catch (error) {
    console.error('Cloudinary audio delete error:', error);
  }
}

export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  // Audio uploads have /video/upload/
  const videoParts = url.split(/\/video\/upload\/(?:v\d+\/)?/);
  if (videoParts.length >= 2) {
    const path = videoParts[1];
    return path.substring(0, path.lastIndexOf('.')) || path;
  }
  // Image uploads have /image/upload/
  const imageParts = url.split(/\/image\/upload\/(?:v\d+\/)?/);
  if (imageParts.length >= 2) {
    const path = imageParts[1];
    return path.substring(0, path.lastIndexOf('.')) || path;
  }
  // Generic fallback if not matched
  const genericParts = url.split(/\/upload\/(?:v\d+\/)?/);
  if (genericParts.length >= 2) {
    const path = genericParts[1];
    return path.substring(0, path.lastIndexOf('.')) || path;
  }
  return null;
}
