import { NextResponse } from "next/server";
import { listarProdutos, criarProduto } from "@/services/produtoService";
import type { ProdutoPayload } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apenasDisponiveis = searchParams.get("disponiveis") === "true";

    const produtos = await listarProdutos(apenasDisponiveis);
    return NextResponse.json(produtos);
  } catch (error) {
    console.error("[GET /api/produtos]", error);
    return NextResponse.json(
      { erro: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: ProdutoPayload = await request.json();

    if (!body.nome || body.preco === undefined) {
      return NextResponse.json(
        { erro: "nome e preco são obrigatórios" },
        { status: 400 }
      );
    }

    const produtoId = await criarProduto(body);
    return NextResponse.json({ id: produtoId }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/produtos]", error);
    return NextResponse.json(
      { erro: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}