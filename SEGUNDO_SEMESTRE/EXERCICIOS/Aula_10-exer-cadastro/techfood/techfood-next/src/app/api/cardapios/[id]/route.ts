import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cardapio = await prisma.cardapio.findUnique({
      where: { id: Number(id) },
      include: {
        produtos: {
          include: {
            produto: true
          }
        }
      }
    });

    if (!cardapio) {
      return NextResponse.json({ sucesso: false, mensagem: "Cardápio não encontrado" }, { status: 404 });
    }

    const dados = {
      ...cardapio,
      produtos: cardapio.produtos.map(cp => cp.produto)
    };

    return NextResponse.json({
      sucesso: true,
      dados
    });
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, mensagem: "Erro interno do servidor", erro: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existe = await prisma.cardapio.findUnique({ where: { id: Number(id) } });
    if (!existe) {
      return NextResponse.json({ sucesso: false, mensagem: "Cardápio não encontrado" }, { status: 404 });
    }

    await prisma.cardapio.delete({ where: { id: Number(id) } });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Cardápio apagado com sucesso"
    });
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, mensagem: "Erro interno do servidor", erro: error.message }, { status: 500 });
  }
}
