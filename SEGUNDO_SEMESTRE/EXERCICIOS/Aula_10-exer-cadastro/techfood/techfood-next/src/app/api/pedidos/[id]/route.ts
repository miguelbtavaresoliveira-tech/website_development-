import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(pedido);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ erro: 'O campo status é obrigatório.' }, { status: 400 });
    }

    const statusValidos = ['pendente', 'preparo', 'pronto', 'entregue'];
    if (!statusValidos.includes(status)) {
      return NextResponse.json({ erro: `Status inválido. Permitidos: ${statusValidos.join(', ')}` }, { status: 400 });
    }

    const pedidoExistente = await prisma.pedido.findUnique({ where: { id: Number(id) } });
    if (!pedidoExistente) {
      return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 });
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        itens: {
          include: { produto: true }
        }
      }
    });

    return NextResponse.json({
      mensagem: 'Status atualizado com sucesso',
      pedido: pedidoAtualizado
    });
  } catch (error: any) {
    const code = error.message?.includes('não encontrado') ? 404 : 400;
    return NextResponse.json({ erro: error.message }, { status: code });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pedidoExistente = await prisma.pedido.findUnique({ where: { id: Number(id) } });

    if (!pedidoExistente) {
      return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 });
    }

    await prisma.pedido.delete({ where: { id: Number(id) } });

    return NextResponse.json({ mensagem: 'Pedido excluído com sucesso' });
  } catch (error: any) {
    const code = error.message?.includes('não encontrado') ? 404 : 400;
    return NextResponse.json({ erro: error.message }, { status: code });
  }
}
