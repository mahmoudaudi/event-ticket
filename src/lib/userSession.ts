/**
 * User Session Management Utility
 * 
 * Manages temporary user identification during the booking flow.
 * In production, this should be replaced with proper authentication/session management.
 */

const USER_SESSION_KEY = 'event_ticket_user_id';

/**
 * Generate a temporary user ID for the current session
 * In production, this should be the authenticated user's ID from the backend
 */
export function generateSessionUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  // Generate a MongoDB-like ObjectId format for demo purposes
  return `${timestamp}${random}`.substring(0, 24);
}

/**
 * Store user ID in session storage
 * Call this when a user starts the booking flow (e.g., from seat selection)
 */
export function setSessionUserId(userId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(USER_SESSION_KEY, userId);
}

/**
 * Get the current session user ID
 * Returns null if no session user ID exists
 */
export function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(USER_SESSION_KEY);
}

/**
 * Initialize a new user session with a generated ID
 * Call this once at the start of the booking journey
 */
export function initializeUserSession(): string {
  const userId = generateSessionUserId();
  setSessionUserId(userId);
  return userId;
}

/**
 * Clear the session user ID
 * Call this after successful booking or when user cancels
 */
export function clearSessionUserId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(USER_SESSION_KEY);
}

/**
 * Check if a valid session exists
 */
export function hasValidSession(): boolean {
  return getSessionUserId() !== null;
}
