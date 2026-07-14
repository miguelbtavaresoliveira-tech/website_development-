import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) }
    });

    if (!produto) {
      return NextResponse.json({ sucesso: false, mensagem: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      sucesso: true,
      dados: produto
    });
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, mensagem: "Erro interno do servidor", erro: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const produtoExistente = await prisma.produto.findUnique({ where: { id: Number(id) } });

    if (!produtoExistente) {
      return NextResponse.json({ sucesso: false, mensagem: "Produto não encontrado" }, { status: 404 });
    }

    const formData = await request.formData();
    
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;
    const preco = formData.get('preco') as string;
    const categoria = formData.get('categoria') as string;
    const disponivel = formData.get('disponivel') as string;
    const imagem = formData.get('imagem') as File | null;

    const produtoAtualizado: any = {};

    if (nome !== undefined) produtoAtualizado.nome = nome.trim();
    if (descricao !== undefined) produtoAtualizado.descricao = descricao.trim();
    
    if (preco !== undefined) {
      const precoNumerico = Number(String(preco).replace(',','.'));
      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        return NextResponse.json({ sucesso: false, mensagem: "Preço deve ser um número positivo" }, { status: 400 });
      }
      produtoAtualizado.preco = precoNumerico;
    }

    if (categoria !== undefined) produtoAtualizado.categoria = categoria;
    
    if (disponivel !== undefined) {
      produtoAtualizado.disponivel = disponivel === 'false' ? false : true;
    }

    if (imagem && imagem.size > 0) {
      if (produtoExistente.imagem_url) {
        const caminhoAntigo = path.join(process.cwd(), 'public', produtoExistente.imagem_url);
        await fs.unlink(caminhoAntigo).catch(() => {});
      }

      const arrayBuffer = await imagem.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `${Date.now()}-${imagem.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      produtoAtualizado.imagem_url = `uploads/${filename}`;
    }

    if (Object.keys(produtoAtualizado).length === 0) {
      return NextResponse.json({ sucesso: false, mensagem: "Nenhum dado válido enviado para atualização" }, { status: 400 });
    }

    await prisma.produto.update({
      where: { id: Number(id) },
      data: produtoAtualizado
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Produto atualizado com sucesso"
    });
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, mensagem: "Erro interno do servidor", erro: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const produtoExistente = await prisma.produto.findUnique({ where: { id: Number(id) } });

    if (!produtoExistente) {
      return NextResponse.json({ sucesso: false, mensagem: "Produto não encontrado" }, { status: 404 });
    }

    if (produtoExistente.imagem_url) {
      const caminhoArquivo = path.join(process.cwd(), 'public', produtoExistente.imagem_url);
      await fs.unlink(caminhoArquivo).catch(() => {});
    }

    await prisma.produto.delete({ where: { id: Number(id) } });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Produto apagado com sucesso"
    });
  } catch (error: any) {
    return NextResponse.json({ sucesso: false, mensagem: "Erro interno do servidor", erro: error.message }, { status: 500 });
  }
}
