"use client";

import { Button } from "@/components/ui";
import { useState } from "react";

export default function PedidosPage() {
  const [carrinho, setCarrinho] = useState(0);

  function adicionarItem() {
    setCarrinho(carrinho + 1);
  }

  return (
    <div>
      <h1>Página de Pedidos</h1>

      <p>
        Itens no seu carrinho: <strong>{carrinho}</strong>
      </p>

      <Button onClick={adicionarItem}>Adicionar Hambúrguer ao carrinho</Button>
    </div>
  );
}