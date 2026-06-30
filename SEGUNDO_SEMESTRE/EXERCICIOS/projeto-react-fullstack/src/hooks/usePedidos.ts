// =============================================================================
// HOOK — usePedidos
// Hook do cliente para buscar e gerenciar pedidos via API Route.
// Use em Client Components ("use client").
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pedido } from "@/types";
import { API_ROUTES } from "@/constants";

interface UsePedidosResult {
  pedidos: Pedido[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePedidos(): UsePedidosResult {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ROUTES.PEDIDOS);

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }

      const data: Pedido[] = await response.json();
      setPedidos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  return { pedidos, isLoading, error, refetch: fetchPedidos };
}
