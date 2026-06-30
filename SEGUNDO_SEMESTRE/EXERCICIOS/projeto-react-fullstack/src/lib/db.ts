// =============================================================================
// LIB — Conexão com o banco de dados (MySQL)
// ATENÇÃO: Este arquivo só deve ser importado em Server Components,
//          API Routes e Server Actions. NUNCA no lado do cliente.
// =============================================================================

import mysql from "mysql2/promise";

// Pool de conexões reutilizável — mais eficiente do que criar uma
// conexão nova a cada request
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Reconecta automaticamente em caso de queda
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export default pool;