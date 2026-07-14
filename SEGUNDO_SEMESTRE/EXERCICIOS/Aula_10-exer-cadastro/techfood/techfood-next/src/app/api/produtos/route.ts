import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany();
    return NextResponse.json({
      sucesso: true,
      dados: produtos,
      total: produtos.length
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
  try {
    const formData = await request.formData();
    
    const nome = formData.get('nome') as string;
    const descricao = formData.get('descricao') as string;
    const preco = formData.get('preco') as string;
    const categoria = formData.get('categoria') as string;
    const disponivel = formData.get('disponivel') as string;
    const imagem = formData.get('imagem') as File | null;

    if (!nome?.trim() || !descricao?.trim() || preco === undefined) {
      return NextResponse.json({ sucesso: false, mensagem: "Nome, descrição e preço devem ser preenchidos" }, { status: 400 });
    }

    const precoNumerico = Number(String(preco).replace(',','.'));
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      return NextResponse.json({ sucesso: false, mensagem: "Preço deve ser um número positivo" }, { status: 400 });
    }

    let imagem_url = null;

    if (imagem && imagem.size > 0) {
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
      imagem_url = `uploads/${filename}`;
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        categoria: categoria || null,
        disponivel: disponivel === 'false' ? false : true,
        imagem_url
      }
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso",
      resultado: novoProduto
    });

  } catch (error: any) {
    return NextResponse.json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      erro: error.message
    }, { status: 500 });
  }
}
