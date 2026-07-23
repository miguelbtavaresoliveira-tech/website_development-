import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountType } from "@prisma/client";
import { error } from "next/dist/build/output/log";
import { NextRequest, NextResponse } from "next/server";
import { gte } from "zod";


export async function GET(request: NextRequest) {
    try {

        //recuperar a sessão do usuário de forma segura
        const session = await auth()

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Não autorizado. Faça o login" },
                { status: 401 },
            );
        }

        const userid = session.user.id

        //buscar a conta bancária vinculada ao usuario logado
        const userAccount = await prisma.account.findFirst({
            where: {
                userId: userid,
            },
        });

        if (!userAccount) {
            return NextResponse.json(
                { error: "Nenhuma conta bancária encontrada para este usuário." },
                { status: 404 }
            );
        };

        const accountId = userAccount.id


        // 1. Extrair os parâmetros de busca da URL
        const { searchParams } = request.nextUrl;
        const searchQuery = searchParams.get('search') || undefined;
        const type = searchParams.get('type') || undefined;

        // Como a URL envia tudo como string, precisamos converter para números
        const minAmount = searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined;
        const maxAmount = searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined;
        const daysAgo = searchParams.get('daysAgo') ? Number(searchParams.get('daysAgo')) : undefined;
        const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

        // 2. Validação simples de segurança
        if (!accountId) {
            return NextResponse.json(
                { error: 'O parâmetro accountId é obrigatório.' },
                { status: 400 }
            );
        }

        const pageSize = 15;

        // 3. Executar a busca no Prisma
        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { senderAccountId: accountId },
                    { receiverAccountId: accountId },
                ],
                // O "as any" aqui garante que o prisma aceite a string se ela bater com o ENUM do banco
                transactionType: type ? (type as any) : undefined,
                amount: {
                    gte: minAmount,
                    lte: maxAmount,
                },
                description: searchQuery ? {
                    contains: searchQuery,
                    mode: 'insensitive',
                } : undefined,
                createdAt: daysAgo ? {
                    gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
                } : undefined,

            },
            orderBy: {
                createdAt: 'desc',
            },
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        //4. Retornar a reposta com status 200 OK
        return NextResponse.json({
            page,
            pageSize,
            data: transactions,
        })

    } catch (error) {
        console.error("Erro na API de transações", error)
        return NextResponse.json(
            { error: 'Erro interno ao processar a busca de transações' },
            { status: 500 }
        )
    }
}