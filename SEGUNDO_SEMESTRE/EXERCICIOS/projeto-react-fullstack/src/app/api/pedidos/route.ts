import { NextResponse } from "next/server";
import { listarPedidos, criarPedido } from "@/services/pedidoService";
import type { CriarPedidoPayload } from "@/types";

export async function GET() {
  try {
    const pedidos = await listarPedidos();
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("[GET /api/pedidos]", error);
    return NextResponse.json(
      { erro: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CriarPedidoPayload = await request.json();

    if (!body.cliente_nome || !body.itens?.length) {
      return NextResponse.json(
        { erro: "cliente_nome e itens são obrigatórios" },
        { status: 400 }
      );
    }

    const pedidoId = await criarPedido(body);
    return NextResponse.json({ id: pedidoId }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json(
      { erro: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}