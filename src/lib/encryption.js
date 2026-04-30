/**
 * Web Crypto API encryption/decryption for sync queue data
 * Uses AES-GCM for authenticated encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 128; // 128 bits for authentication tag

/**
 * Derive encryption key from user ID and device fingerprint
 * @param {string} userId - User ID from AuthContext
 * @returns {Promise<CryptoKey>} The derived encryption key
 */
export async function deriveEncryptionKey(userId) {
  try {
    // Create a base key from user ID
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + (navigator.userAgent || ''));

    // Import the data as a key
    const baseKey = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, [
      'deriveBits',
      'deriveKey',
    ]);

    // Derive the actual encryption key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('biblefunland-offline-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  } catch (error) {
    console.error('❌ Error deriving encryption key:', error);
    throw error;
  }
}

/**
 * Encrypt data using AES-GCM
 * @param {Object} data - Data to encrypt
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<Object>} Object with encrypted data and IV
 */
export async function encryptData(data, key) {
  try {
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      key,
      plaintext
    );

    // Return IV and ciphertext as base64 strings
    return {
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext),
      algorithm: ALGORITHM,
    };
  } catch (error) {
    console.error('❌ Error encrypting data:', error);
    throw error;
  }
}

/**
 * Decrypt data using AES-GCM
 * @param {Object} encryptedData - Object with iv and ciphertext
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<Object>} Decrypted data
 */
export async function decryptData(encryptedData, key) {
  try {
    const { iv, ciphertext } = encryptedData;

    // Convert base64 strings back to ArrayBuffers
    const ivBuffer = base64ToArrayBuffer(iv);
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);

    // Decrypt the data
    const plaintext = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: ivBuffer,
        tagLength: TAG_LENGTH,
      },
      key,
      ciphertextBuffer
    );

    // Decode and parse the plaintext
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(plaintext);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ Error decrypting data:', error);
    throw error;
  }
}

/**
 * Convert ArrayBuffer to base64 string
 * @param {ArrayBuffer} buffer - Buffer to convert
 * @returns {string} Base64 encoded string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 * @param {string} base64 - Base64 encoded string
 * @returns {ArrayBuffer} Decoded buffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt sensitive fields in a sync queue entry
 * @param {Object} entry - Sync queue entry
 * @param {CryptoKey} key - Encryption key
 * @returns {Promise<Object>} Entry with encrypted payload
 */
export async function encryptSyncQueueEntry(entry, key) {
  try {
    const encryptedPayload = await encryptData(entry.payload, key);
    return {
      ...entry,
      payload: encryptedPayload,
      encrypted: true,
    };
  } catch (error) {
    console.error('❌ Error encrypting sync queue entry:', error);
    throw error;
  }
}

/**
 * Decrypt sensitive fields in a sync queue entry
 * @param {Object} entry - Sync queue entry with encrypted payload
 * @param {CryptoKey} key - Decryption key
 * @returns {Promise<Object>} Entry with decrypted payload
 */
export async function decryptSyncQueueEntry(entry, key) {
  try {
    if (!entry.encrypted || !entry.payload.ciphertext) {
      return entry;
    }

    const decryptedPayload = await decryptData(entry.payload, key);
    return {
      ...entry,
      payload: decryptedPayload,
      encrypted: false,
    };
  } catch (error) {
    console.error('❌ Error decrypting sync queue entry:', error);
    throw error;
  }
}
