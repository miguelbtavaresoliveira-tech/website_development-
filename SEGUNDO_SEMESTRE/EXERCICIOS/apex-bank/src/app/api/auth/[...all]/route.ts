import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js';'@/auth'

/*export const { GET, POST } = handlers*/

export const { POST, GET } = toNextJsHandler(auth)