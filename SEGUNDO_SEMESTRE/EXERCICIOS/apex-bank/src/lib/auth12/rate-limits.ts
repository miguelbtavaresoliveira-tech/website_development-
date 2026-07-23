import { EntryTypes } from "next/dist/server/dev/on-demand-entry-handler";
import { RATE_LIMIT_MAX_ATTEMPTS, RATE_LIMIT_WINDOW_MS } from "./constants";


interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const loginAttemps = new Map<string, RateLimitEntry>()

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMs?: number} {
    const now = Date.now()
    const entry = loginAttemps.get(identifier)

    if (!entry || now > entry.resetAt) {
        loginAttemps.set(identifier, {
            count: 1,
            resetAt: now + RATE_LIMIT_WINDOW_MS
        })
        return { allowed: true }
    }

    if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
        return { allowed: false, retryAfterMs: entry.resetAt - now }
    }

    entry.count += 1
    return { allowed: true }
}

export function resetRateLimit(identifier: string): void {
    loginAttemps.delete(identifier)
}