import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hamburgueriatavares',
  database: process.env.DB_NAME || 'sua_hamburgueria',
  waitForConnections: true,
  connectionLimit: 10,
});