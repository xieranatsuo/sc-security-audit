/**
 * Simple auth utilities.
 * In production, use bcrypt for password hashing and a proper database.
 * For this demo, we use crypto.subtle for hashing and in-memory storage.
 */

const COOKIE_NAME = 'audit_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory user store (would be PostgreSQL in production)
const users = new Map();

// In-memory session store
const sessions = new Map();

/**
 * Hash a password using SHA-256.
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'audit_platform_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a hash.
 */
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Create a new user.
 */
export async function createUser(email, password, name) {
  if (users.has(email.toLowerCase())) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);
  const user = {
    id: `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    plan: 'enterprise',
    createdAt: new Date().toISOString(),
  };

  users.set(email.toLowerCase(), user);
  return { id: user.id, email: user.email, name: user.name, plan: user.plan };
}

/**
 * Authenticate a user by email and password.
 */
export async function authenticateUser(email, password) {
  const user = users.get(email.toLowerCase());
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  return { id: user.id, email: user.email, name: user.name, plan: user.plan };
}

/**
 * Create a session and return the session token.
 */
export function createSession(userId) {
  const token = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  const session = {
    token,
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  };

  sessions.set(token, session);
  return token;
}

/**
 * Get session from token.
 */
export function getSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

/**
 * Delete a session.
 */
export function deleteSession(token) {
  sessions.delete(token);
}

/**
 * Get user by ID.
 */
export function getUserById(id) {
  for (const user of users.values()) {
    if (user.id === id) {
      return { id: user.id, email: user.email, name: user.name, plan: user.plan };
    }
  }
  return null;
}

export { COOKIE_NAME };
