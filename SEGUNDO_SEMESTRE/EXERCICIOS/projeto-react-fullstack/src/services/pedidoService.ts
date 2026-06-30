// =============================================================================
// SERVICE — Pedidos
// Camada de acesso a dados para pedidos.
// ATENÇÃO: Só roda no servidor (API Routes / Server Actions).
// =============================================================================

import pool from "@/lib/db";
import type { CriarPedidoPayload, Pedido } from "@/types";

/**
 * Retorna todos os pedidos do banco de dados
 */
export async function listarPedidos(): Promise<Pedido[]> {
  const [rows] = await pool.query(
    "SELECT * FROM pedidos ORDER BY criado_em DESC"
  );
  return rows as Pedido[];
}

/**
 * Retorna um pedido pelo ID, incluindo seus itens
 */
export async function buscarPedidoPorId(id: number): Promise<Pedido | null> {
  const [rows] = await pool.query(
    "SELECT * FROM pedidos WHERE id = ? LIMIT 1",
    [id]
  );
  const pedidos = rows as Pedido[];
  return pedidos.length > 0 ? pedidos[0] : null;
}

/**
 * Cria um novo pedido com seus itens em uma transação atômica.
 * Se qualquer etapa falhar, tudo é revertido (rollback).
 */
export async function criarPedido(dados: CriarPedidoPayload): Promise<number> {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    // 1. Calcula o total buscando preços do banco
    let total = 0;
    for (const item of dados.itens) {
      const [rows]: any = await conexao.query(
        "SELECT preco FROM produtos WHERE id = ?",
        [item.produto_id]
      );
      if (rows.length === 0) throw new Error(`Produto ${item.produto_id} não encontrado`);
      total += rows[0].preco * item.quantidade;
    }

    // 2. Insere o pedido principal
    const [resultadoPedido]: any = await conexao.query(
      'INSERT INTO pedidos (cliente_nome, total, status) VALUES (?, ?, "pendente")',
      [dados.cliente_nome, total]
    );
    const pedidoId: number = resultadoPedido.insertId;

    // 3. Insere cada item do pedido
    for (const item of dados.itens) {
      const [prodRows]: any = await conexao.query(
        "SELECT preco FROM produtos WHERE id = ?",
        [item.produto_id]
      );
      const precoUnitario = prodRows[0].preco;
      await conexao.query(
        "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
        [pedidoId, item.produto_id, item.quantidade, precoUnitario]
      );
    }

    await conexao.commit();
    return pedidoId;
  } catch (error) {
    // Reverte tudo se algo falhou
    await conexao.rollback();
    throw error;
  } finally {
    // Libera a conexão de volta ao pool
    conexao.release();
  }
}

/**
 * Atualiza o status de um pedido
 */
export async function atualizarStatusPedido(
  id: number,
  novoStatus: string
): Promise<boolean> {
  const [result]: any = await pool.query(
    "UPDATE pedidos SET status = ? WHERE id = ?",
    [novoStatus, id]
  );
  return result.affectedRows > 0;
}