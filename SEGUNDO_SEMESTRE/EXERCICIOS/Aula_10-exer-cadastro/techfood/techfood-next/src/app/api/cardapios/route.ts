import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';

export async function GET() {
  try {
    const cardapios = await prisma.cardapio.findMany({
      include: {
        produtos: {
          include: {
            produto: true
          }
        }
      }
    });

    const dados = cardapios.map(c => ({
      ...c,
      produtos: c.produtos.map(cp => cp.produto)
    }));

    return NextResponse.json({
      sucesso: true,
      dados,
      total: dados.length
    });
  } catch (error: any) {
    return NextResponse.json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      erro: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const dados = await request.json();
    const { nome, descricao, disponivel, produtos } = dados;

    if (!nome) {
      return NextResponse.json({ sucesso: false, mensagem: "O nome do cardápio é obrigatório" }, { status: 400 });
    }

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return NextResponse.json({ sucesso: false, mensagem: "O cardápio deve conter pelo menos um produto vinculado no formato de array de IDs (ex: [1, 2, 3])" }, { status: 400 });
    }

    const produtosUnicos = [...new Set(produtos as number[])];
    
    for (const produtoId of produtosUnicos) {
      const produtoExistente = await prisma.produto.findUnique({ where: { id: produtoId } });
      if (!produtoExistente) {
        return NextResponse.json({ sucesso: false, mensagem: `Produto com ID ${produtoId} não encontrado. Cadastro de cardápio cancelado.` }, { status: 404 });
      }
    }

    const novoCardapio = await prisma.cardapio.create({
      data: {
        nome: nome.trim(),
        descricao: descricao ? descricao.trim() : null,
        disponivel: disponivel ?? true,
        produtos: {
          create: produtosUnicos.map(produtoId => ({
            produto: { connect: { id: produtoId } }
          }))
        }
      }
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Cardápio cadastrado com sucesso",
      id: novoCardapio.id
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      erro: error.message
    }, { status: 500 });
  }
}
