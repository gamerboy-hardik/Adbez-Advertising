const crypto = require('crypto');
const config = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;    // 128-bit IV
const TAG_LENGTH = 16;   // 128-bit auth tag
const KEY_LENGTH = 32;   // 256-bit key

// Derive 32-byte key from the hex string in config
function getKey() {
  const hexKey = config.encryption.key;
  if (hexKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).');
  }
  return Buffer.from(hexKey, 'hex');
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: iv_hex:authTag_hex:ciphertext_hex
 * @param {string} plaintext
 * @returns {string} Encrypted string
 */
function encrypt(plaintext) {
  if (!plaintext) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string encrypted with encrypt().
 * @param {string} encryptedString  - Format: iv_hex:authTag_hex:ciphertext_hex
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedString) {
  if (!encryptedString) return null;
  const key = getKey();
  const [ivHex, authTagHex, ciphertextHex] = encryptedString.split(':');

  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('Invalid encrypted string format.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Encrypts a JSON object.
 * @param {object} obj
 * @returns {string} Encrypted string
 */
function encryptJSON(obj) {
  if (!obj) return null;
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts and parses a JSON object.
 * @param {string} encryptedString
 * @returns {object} Parsed JSON
 */
function decryptJSON(encryptedString) {
  if (!encryptedString) return null;
  const plaintext = decrypt(encryptedString);
  return JSON.parse(plaintext);
}

module.exports = { encrypt, decrypt, encryptJSON, decryptJSON };
