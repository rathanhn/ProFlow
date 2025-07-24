
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
