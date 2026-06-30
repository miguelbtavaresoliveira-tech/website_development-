// =============================================================================
// CONSTANTS — Constantes globais da aplicação
// Centralize aqui valores que se repetem para facilitar manutenção
// =============================================================================

// Rotas da aplicação — evita strings mágicas espalhadas pelo código
export const ROTAS = {
  HOME: "/",
  PEDIDOS: "/pedidos",
  PRODUTOS: "/produtos",
} as const;

// Rotas da API — use nas chamadas do cliente
export const API_ROUTES = {
  PEDIDOS: "/api/pedidos",
  PRODUTOS: "/api/produtos",
} as const;

// Status possíveis de um pedido (espelha o type PedidoStatus)
export const PEDIDO_STATUS = {
  PENDENTE: "pendente",
  EM_PREPARO: "em_preparo",
  PRONTO: "pronto",
  ENTREGUE: "entregue",
  CANCELADO: "cancelado",
} as const;

// Labels legíveis para exibição na UI
export const PEDIDO_STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

// Paginação padrão
export const PAGINACAO = {
  ITENS_POR_PAGINA: 10,
} as const;
