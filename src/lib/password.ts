import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** Hashes a plaintext password for storage on the User document. */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

/** Compares a plaintext password against a stored bcrypt hash. */
export async function verifyPassword(
  plainTextPassword: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, storedHash);
}
