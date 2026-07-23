export const AUTH_COOKIE_NAME = 'techfood_token';

export const JWT_EXPIRATION = '8h';

export const BCRYPT_ROUNDS = 12;

export const RATE_LIMIT_MAX_ATTEMPTS = 5;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export const PROTECTED_PAGE_PATHS = ['/cadastro'];

export const PROTECTED_API_PATTERNS = [
  { path: '/api/produtos', methods: ['POST'] },
  { path: '/api/cardapios', methods: ['POST'] },
];
