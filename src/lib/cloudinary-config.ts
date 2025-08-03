'use client';

// Utility to check Cloudinary configuration
export function checkCloudinaryConfig() {
  // Fallback to hard-coded values if environment variables are not set
  const config = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfk9licqv',
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '892517721593495',
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET, // Don't expose the actual secret
  };

  const issues: string[] = [];

  if (!config.cloudName) {
    issues.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  }

  if (!config.apiKey) {
    issues.push('NEXT_PUBLIC_CLOUDINARY_API_KEY is not set');
  }

  // Note: We can't check CLOUDINARY_API_SECRET on client side as it's server-only

  return {
    isValid: issues.length === 0,
    config: {
      cloudName: config.cloudName,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 6)}...` : 'Not set',
    },
    issues,
  };
}

// Generate a fallback avatar URL
export function generateFallbackAvatar(name: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=4F46E5&color=ffffff&bold=true`;
}

// Check if a URL is a Cloudinary URL
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}
