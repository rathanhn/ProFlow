
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

export async function getUploadSignature({ folder }: { folder?: string } = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign: { timestamp: number, folder?: string } = {
    timestamp: timestamp,
  };

  if (folder) {
    paramsToSign.folder = folder;
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return { timestamp, signature, folder };
}


function getPublicIdFromUrl(url: string): string | null {
    try {
        const urlParts = url.split('/');
        const cloudNameIndex = urlParts.indexOf(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);
        if (cloudNameIndex === -1 || cloudNameIndex + 3 >= urlParts.length) {
            return null; // Not a valid Cloudinary URL structure
        }
        // The public_id is everything after "upload", "v<version>"
        const publicIdWithFormat = urlParts.slice(cloudNameIndex + 4).join('/');
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
        
        if (result.result !== 'ok') {
            throw new Error(result.result);
        }

        return { success: true };

    } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
        throw new Error('Could not delete file from Cloudinary.');
    }
}
