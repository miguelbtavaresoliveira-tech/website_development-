import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "./constants";


export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export default function verifyPassword(password: string, passwordhash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordhash)
}