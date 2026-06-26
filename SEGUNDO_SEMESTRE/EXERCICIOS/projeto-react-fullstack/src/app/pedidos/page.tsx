'use client' // 1. Usar sempre que tiver cliques ou interações na página

import Button from "@/src/components/common/Button"
import { useState } from "react"




export default function PedidosPage() {

    const [carrinho, setCarrinho] = useState(0)

    function adicionarItem () {
        setCarrinho(carrinho + 1)
    }

    return (
        <div>
      <h1>Página de Pedidos</h1>
      
      {/* 5. Exibimos o valor da variável direto no meio do HTML usando chaves {} */}
      <p>Itens no seu carrinho: <strong>{carrinho}</strong></p>

      {/* 6. O evento de clique vai direto na tag, sem precisar de id ou addEventListener */}
      <Button onClick={adicionarItem}>
        Adicionar Hamburguer ao carrinho
      </Button>
    </div>
    )
}