import { NextResponse } from "next/server";
import { listarPedidosDoBanco } from "@/src/services/pedidoService";

export async function GET() {
    try {
        const pedidos = await listarPedidosDoBanco()


        return NextResponse.json(pedidos)
    } catch (error) {
        console.error('Erro no backend', error)
        return NextResponse.json({erro: 'Erro ao buscar pedidos no banco'}, {status:500})
    }
}