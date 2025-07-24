
'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
