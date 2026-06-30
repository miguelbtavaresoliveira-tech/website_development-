// =============================================================================
// SERVICE — Produtos
// Camada de acesso a dados para produtos.
// ATENÇÃO: Só roda no servidor (API Routes / Server Actions).
// =============================================================================

import pool from "@/lib/db";
import type { Produto, ProdutoPayload } from "@/types";

/**
 * Retorna todos os produtos disponíveis
 */
export async function listarProdutos(apenasDisponiveis = false): Promise<Produto[]> {
  const query = apenasDisponiveis
    ? "SELECT * FROM produtos WHERE disponivel = true ORDER BY nome"
    : "SELECT * FROM produtos ORDER BY nome";

  const [rows] = await pool.query(query);
  return rows as Produto[];
}

/**
 * Retorna um produto pelo ID
 */
export async function buscarProdutoPorId(id: number): Promise<Produto | null> {
  const [rows] = await pool.query(
    "SELECT * FROM produtos WHERE id = ? LIMIT 1",
    [id]
  );
  const produtos = rows as Produto[];
  return produtos.length > 0 ? produtos[0] : null;
}

/**
 * Cria um novo produto
 */
export async function criarProduto(dados: ProdutoPayload): Promise<number> {
  const [result]: any = await pool.query(
    "INSERT INTO produtos (nome, descricao, preco, categoria, disponivel, imagem_url) VALUES (?, ?, ?, ?, ?, ?)",
    [dados.nome, dados.descricao ?? null, dados.preco, dados.categoria, dados.disponivel ?? true, dados.imagem_url ?? null]
  );
  return result.insertId;
}