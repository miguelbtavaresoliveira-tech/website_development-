import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            produto: true
          }
        }
      },
      orderBy: { criado_em: 'desc' }
    });
    return NextResponse.json(pedidos);
  } catch (error: any) {
    return NextResponse.json({ erro: 'Erro ao buscar pedidos', detalhe: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const pedidoData = await request.json();
    const { cliente, itens } = pedidoData;

    if (!itens || itens.length === 0) {
      return NextResponse.json({ erro: 'O pedido deve conter ao menos um item.' }, { status: 400 });
    }

    let totalCalculado = 0;
    const itensCompletos: { produto_id: number; quantidade: number; preco_unitario: number }[] = [];

    for (const item of itens) {
      if (!item.produto_id || !item.quantidade || item.quantidade <= 0) {
        return NextResponse.json({ erro: 'Cada item deve ter produto_id e quantidade maior que zero.' }, { status: 400 });
      }

      const produto = await prisma.produto.findUnique({ where: { id: item.produto_id } });
      if (!produto) {
        return NextResponse.json({ erro: `Produto com ID ${item.produto_id} não encontrado.` }, { status: 400 });
      }
      if (!produto.disponivel) {
        return NextResponse.json({ erro: `O produto ${produto.nome} está indisponível para pedidos.` }, { status: 400 });
      }

      const precoNum = Number(produto.preco);
      const subtotal = precoNum * item.quantidade;
      totalCalculado += subtotal;

      itensCompletos.push({
        produto_id: produto.id,
        quantidade: item.quantidade,
        preco_unitario: precoNum
      });
    }

    const pedido = await prisma.pedido.create({
      data: {
        cliente: cliente || null,
        status: 'pendente',
        total: totalCalculado,
        itens: {
          create: itensCompletos.map(item => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario
          }))
        }
      },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });

    return NextResponse.json({
      mensagem: 'Pedido criado com sucesso',
      pedido
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
