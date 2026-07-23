import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from './constants';

export async function hashPassword(senha: string): Promise<string> {
  return bcrypt.hash(senha, BCRYPT_ROUNDS);
}

export async function verifyPassword(senha: string, senhaHash: string): Promise<boolean> {
  return bcrypt.compare(senha, senhaHash);
}
