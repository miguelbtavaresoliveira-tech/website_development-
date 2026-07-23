/**
 * TOTP (Time-based One-Time Password) — RFC 6238 + RFC 4226
 * Implementação do zero com Node.js crypto nativo.
 * Zero dependências de terceiros para criptografia.
 */
import { createHmac, randomBytes } from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Codifica bytes em Base32 (sem padding) */
function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

/** Decodifica Base32 para Buffer */
function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of cleaned) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) throw new Error(`Caractere Base32 inválido: ${char}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Gera um segredo aleatório em Base32 (20 bytes = 160 bits).
 * RFC 4226 recomenda no mínimo 128 bits; usamos 160 para maior entropia.
 */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/**
 * Calcula um código HOTP (HMAC-based OTP) para um contador dado.
 * RFC 4226 §5
 */
function hotp(secret: string, counter: bigint): string {
  const key = base32Decode(secret);
  const buf = Buffer.allocUnsafe(8);
  buf.writeBigUInt64BE(counter);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

/**
 * Valida um código TOTP (Time-based OTP).
 * Aceita janela de ±1 intervalo (30 s) para tolerar desvios de relógio.
 * RFC 6238 §5
 */
export function verifyTOTP(token: string, secret: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  const step = BigInt(30);
  const now = BigInt(Math.floor(Date.now() / 1000));
  const counter = now / step;
  // Verifica o período atual e os 2 adjacentes (-1, 0, +1)
  for (let delta = -1n; delta <= 1n; delta++) {
    if (hotp(secret, counter + delta) === token) return true;
  }
  return false;
}

/**
 * Gera o URI padrão para aplicativos autenticadores (RFC 6238).
 * Formato: otpauth://totp/{issuer}:{email}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30
 */
export function getOTPAuthURI(email: string, secret: string, issuer = 'TechFood'): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?${params.toString()}`;
}
