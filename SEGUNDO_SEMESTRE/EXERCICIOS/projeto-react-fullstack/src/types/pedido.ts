// =============================================================================
// TYPES — Pedido
// =============================================================================

export type PedidoStatus = "pendente" | "em_preparo" | "pronto" | "entregue" | "cancelado";

export interface ItemPedido {
  id: number;
  produto_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  cliente_nome: string;
  status: PedidoStatus;
  total: number;
  itens?: ItemPedido[];
  criado_em: string; // ISO date string
  atualizado_em?: string;
}

/** Payload para criar um novo pedido (POST /api/pedidos) */
export interface CriarPedidoPayload {
  cliente_nome: string;
  itens: {
    produto_id: number;
    quantidade: number;
  }[];
}
