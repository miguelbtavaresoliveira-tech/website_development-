// =============================================================================
// TYPES — Produto
// =============================================================================

export type Categoriaproduto = "lanche" | "bebida" | "sobremesa" | "acompanhamento";

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: Categoriaproduto;
  disponivel: boolean;
  imagem_url?: string;
  criado_em?: string;
}

/** Payload para criar/atualizar um produto */
export interface ProdutoPayload {
  nome: string;
  descricao?: string;
  preco: number;
  categoria: Categoriaproduto;
  disponivel?: boolean;
  imagem_url?: string;
}
