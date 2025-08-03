import { auth } from '@/lib/firebase';
import { getAdminByEmail } from '@/lib/firebase-service';

/**
 * Server-side authentication check for admin routes
 * This is a basic implementation - in production, use proper server-side auth
 */
export async function checkAdminAuth(): Promise<boolean> {
  try {
    // In a real app, you'd verify the session token server-side
    // For now, we'll do a basic check
    const currentUser = auth.currentUser;
    
    if (!currentUser || !currentUser.email) {
      return false;
    }

    // Check if user is an admin
    const adminRecord = await getAdminByEmail(currentUser.email);
    return !!adminRecord;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

/**
 * Check if current user has permission to edit a specific resource
 */
export async function checkEditPermission(resourceType: 'task' | 'client', resourceId: string): Promise<boolean> {
  try {
    // Basic admin check - in production, implement proper RBAC
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return false;
    }

    // Additional resource-specific checks can be added here
    // For example, checking if the resource exists, user ownership, etc.
    
    return true;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

/**
 * Validate that a route parameter is a valid ID
 */
export function validateRouteId(id: string | undefined): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Basic validation - adjust based on your ID format
  if (id.length < 3 || id.length > 50) {
    return false;
  }
  
  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /\.\./,  // Path traversal
    /[<>]/,  // HTML injection
    /javascript:/i,  // JavaScript injection
    /data:/i,  // Data URI
  ];
  
  return !maliciousPatterns.some(pattern => pattern.test(id));
}

/**
 * Sanitize route parameters to prevent injection attacks
 */
export function sanitizeRouteParam(param: string): string {
  return param
    .replace(/[<>]/g, '') // Remove HTML characters
    .replace(/javascript:/gi, '') // Remove JavaScript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .trim();
}
