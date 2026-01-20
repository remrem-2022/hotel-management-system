/**
 * Password hashing and verification using Web Crypto API
 * Uses PBKDF2 with SHA-256 for secure password hashing
 */

const ITERATIONS = 100000;
const HASH_LENGTH = 32;
const SALT_LENGTH = 16;

/**
 * Generate a random salt
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Derive a key from password and salt using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const importedKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    importedKey,
    HASH_LENGTH * 8
  );

  return new Uint8Array(derivedBits);
}

/**
 * Convert Uint8Array to hex string
 */
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to Uint8Array
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Hash a password
 * Returns a string in the format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const hash = await deriveKey(password, salt);

  return `${toHex(salt)}:${toHex(hash)}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(":");

    if (!saltHex || !hashHex) {
      return false;
    }

    const salt = fromHex(saltHex);
    const expectedHash = fromHex(hashHex);
    const actualHash = await deriveKey(password, salt);

    // Constant-time comparison
    if (expectedHash.length !== actualHash.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < expectedHash.length; i++) {
      result |= expectedHash[i] ^ actualHash[i];
    }

    return result === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a random token for session management
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return toHex(array);
}
