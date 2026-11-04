// Enkripsi embedding wajah (AES-256-GCM). Data biometrik tidak pernah disimpan sebagai teks biasa.
// Format Buffer: [IV 12 byte][AuthTag 16 byte][ciphertext]
const crypto = require('crypto');

function getKey() {
  const hex = process.env.FACE_ENC_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('FACE_ENC_KEY harus 64 karakter hex (32 byte). Lihat .env.example');
  }
  return Buffer.from(hex, 'hex');
}

/** @param {number[]|Float32Array} embedding */
function encryptEmbedding(embedding) {
  const raw = Buffer.from(new Float32Array(embedding).buffer);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(raw), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}

/** @param {Buffer} blob @returns {Float32Array} */
function decryptEmbedding(blob) {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const data = blob.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  const raw = Buffer.concat([decipher.update(data), decipher.final()]);
  const copy = new Uint8Array(raw).buffer; // salin agar alignment aman
  return new Float32Array(copy);
}

/** Cosine similarity untuk pencocokan 1:1 (sisi server). */
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

module.exports = { encryptEmbedding, decryptEmbedding, cosineSimilarity };
