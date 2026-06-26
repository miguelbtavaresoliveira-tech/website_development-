import { pool } from "../lib/db";

export async function listarPedidosDoBanco() {
    const [rows] = await pool.query('SELECT * FROM pedidos')
    return rows
}