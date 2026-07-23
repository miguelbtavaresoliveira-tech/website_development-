import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';
import { StatusPedido } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor', erro: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  // Permite apenas admin e garcom
  if (auth.role !== 'admin' && auth.role !== 'garcom') {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Não autorizado. Apenas equipe autorizada.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = Object.values(StatusPedido);
    if (!status || !validStatuses.includes(status as StatusPedido)) {
      return NextResponse.json(
        { sucesso: false, mensagem: `Status inválido. Deve ser um de: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });

    if (!pedidoExistente) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status: status as StatusPedido },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Status do pedido atualizado com sucesso',
      pedido: pedidoAtualizado,
    });
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor', erro: error.message },
      { status: 500 }
    );
  }
}

// Também aceita PUT para o mesmo propósito
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  // Apenas admin pode excluir/cancelar pedidos
  if (auth.role !== 'admin') {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Não autorizado. Apenas administradores podem excluir pedidos.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id: Number(id) },
    });

    if (!pedidoExistente) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    await prisma.pedido.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Pedido excluído com sucesso',
    });
  } catch (error: any) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor', erro: error.message },
      { status: 500 }
    );
  }
}
