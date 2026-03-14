/**
 * AES-256-GCM encryption for sensitive request/response payload fields.
 * Uses ENCRYPTION_KEY from env (64 hex chars = 32 bytes).
 */

const ALG = "AES-GCM";
const IV_LEN = 12;
const TAG_LEN = 128;

function getKey(): CryptoKey {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length !== 64 || !/^[0-9a-fA-F]+$/.test(raw)) {
    throw new Error("ENCRYPTION_KEY must be 64 hex characters");
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = parseInt(raw.slice(i * 2, i * 2 + 2), 16);
  return crypto.subtle.importKey("raw", bytes, { name: ALG, length: 256 }, false, ["encrypt", "decrypt"]);
}

let keyPromise: Promise<CryptoKey> | null = null;

function key(): Promise<CryptoKey> {
  if (!keyPromise) keyPromise = getKey();
  return keyPromise;
}

export async function encrypt(plain: string): Promise<string> {
  const k = await key();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const encoded = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt(
    { name: ALG, iv, tagLength: TAG_LEN },
    k,
    encoded
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.length);
  return Buffer.from(combined).toString("base64url");
}

export async function decrypt(cipherText: string): Promise<string> {
  const k = await key();
  const combined = Buffer.from(cipherText, "base64url");
  const iv = combined.subarray(0, IV_LEN);
  const cipher = combined.subarray(IV_LEN);
  const plain = await crypto.subtle.decrypt(
    { name: ALG, iv, tagLength: TAG_LEN },
    k,
    cipher
  );
  return new TextDecoder().decode(plain);
}
