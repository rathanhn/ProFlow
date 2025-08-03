
'use server';

import { v2 as cloudinary } from 'cloudinary';

// This is a server-side module, so we use the server-side environment variables.
// These should not have the NEXT_PUBLIC_ prefix.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Cloud name can be public
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,       // API key for server-side can be public
  api_secret: process.env.CLOUDINARY_API_SECRET, // API secret is private and must not be exposed
  secure: true,
});

export async function getUploadSignature({ folder, use_filename = true, unique_filename = false }: { folder?: string, use_filename?: boolean, unique_filename?: boolean } = {}) {
  // Use fallback values if environment variables are not set
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mgJItCh5ztdwq9rRej_uTnAXtF0';
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '892517721593495';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfk9licqv';

  if (!apiSecret) {
    console.error('CLOUDINARY_API_SECRET is not available');
    throw new Error('Cloudinary API secret is not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign: { timestamp: number, folder?: string, use_filename?: boolean, unique_filename?: boolean } = {
    timestamp: timestamp,
    use_filename,
    unique_filename,
  };

  if (folder) {
    paramsToSign.folder = folder;
  }

  try {
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    console.log('Upload signature generated successfully');
    return { timestamp, signature, folder, use_filename, unique_filename };
  } catch (error) {
    console.error('Failed to generate signature:', error);
    throw new Error('Failed to generate upload signature');
  }
}


function getPublicIdFromUrl(url: string): string | null {
    try {
        const urlParts = url.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
            return null; // Invalid Cloudinary URL structure
        }

        // The public_id is the part of the URL after the version number and before the file extension
        const publicIdWithFormat = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.'));
        
        return publicId;
    } catch (e) {
        console.error("Failed to parse public ID from URL", e);
        return null;
    }
}

export async function deleteFileByUrl(url: string) {
    const publicId = getPublicIdFromUrl(url);

    if (!publicId) {
        throw new Error('Could not determine public_id from URL.');
    }
    
    // Determine resource type based on URL
    const isImage = /\/image\/upload/.test(url);
    const resourceType = isImage ? 'image' : 'raw';

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        
        if (result.result !== 'ok' && result.result !== 'not found') {
            console.error("Cloudinary deletion error:", result);
            throw new Error(result.result);
        }

        return { success: true };

    } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        throw new Error('Could not delete file from Cloudinary.');
    }
}
