Estou fazendo um projeto chamado apex-bank, ele  é  uma aplicação com este contexo 



🏢 1. Project OverviewProject Name: ApexBankDescription: A high-performance Open Finance and investment management dashboard.Target Audience: Recruiters and engineering managers at Big Techs and major financial institutions.Language Standard: English strictly applied to all code, variables, database columns, commits, and inline comments.🛠️ 2. Tech Stack & Dependencies InstalledAbaixo estão todas as tecnologias e bibliotecas que já instalamos e configuramos no projeto até este momento:LayerTechnology / LibraryPurposeFrameworkNext.js (App Router)React framework for server-side rendering and API routes.LanguageTypeScriptStatic typing to prevent runtime errors.StylingTailwind CSSUtility-first CSS framework for rapid UI development.UI ComponentsShadcn/uiAccessible, customizable components (Button, Input, Card, Dialog).Icons & FontsLucide Icons / Geist FontEnterprise-grade visual identity and typography.DatabaseMySQLRelational database (already hosted/running locally).ORM@prisma/client & prismaDatabase mapping and type-safe query builder.Authenticationnext-auth@beta (Auth.js)Complete authentication lifecycle and session management.Securitybcryptjs & @types/bcryptjsCryptographic hashing for user passwords (Edge compatible).🏗️ 3. Software Architecture & PatternsImplementamos padrões de arquitetura exigidos em aplicações de larga escala para garantir performance e segurança.Database First Approach: Como o banco MySQL já existia, usamos o Prisma apenas como ponte de leitura, utilizando a diretriz @map no schema.prisma para traduzir o padrão snake_case do banco de dados para o padrão camelCase do TypeScript.Singleton Pattern: Implementado no arquivo src/lib/prisma.ts para garantir que o Next.js não abra múltiplas conexões com o MySQL durante o Hot Reloading, prevenindo o esgotamento do banco.Edge Computing Security: O arquivo src/middleware.ts intercepta todas as requisições na "borda" (servidores globais), bloqueando usuários não autenticados antes mesmo de a requisição chegar ao nosso servidor principal.Stateless JWT Sessions: A autenticação não consome memória do servidor. O nível de acesso (role) e o ID do usuário são criptografados dentro de um token JWT impenetrável.Centralized Routing: O arquivo src/routes.ts atua como a única fonte de verdade para rotas públicas e privadas, evitando hardcoding de strings pelo sistema.🗄️ 4. Database Schema (MySQL)O banco de dados relacional foi modelado com foco absoluto em precisão financeira e segurança.Users: id (UUID), name, email, cpf, password_hash, role (STANDARD_CLIENT, PREMIUM_CLIENT, ADMIN), created_at, updated_at.Accounts: id (UUID), user_id, account_number, balance (DECIMAL 15,2), account_type (CHECKING, SAVINGS), created_at.Transactions: id (UUID), sender_account_id, receiver_account_id, amount (DECIMAL 15,2), transaction_type (PIX, TED, DEPOSIT, PAYMENT), description, created_at.Investments: id (UUID), user_id, asset_ticker, quantity (DECIMAL 10,4), purchase_price (DECIMAL 15,2), created_at.✅ 5. What is Already Done (Foundation)Criação e estruturação inicial do projeto Next.js com Tailwind e Shadcn/ui.Modelagem e execução do script SQL para criação do banco de dados MySQL.Instalação das bibliotecas de infraestrutura (Prisma, NextAuth, Bcryptjs).Configuração do cofre de chaves no .env (DATABASE_URL e AUTH_SECRET).Mapeamento completo do banco de dados no arquivo prisma/schema.prisma.Geração do Prisma Client para tipagem inteligente em TypeScript.Refatoração completa da autenticação com o padrão de 4 arquivos (Routes, Auth Config, Auth Main e Middleware).🗺️ 6. Roadmap: What is Left to Build (Backlog)Com a fundação de dados e segurança 100% pronta, estas são as próximas fases que executaremos:Phase 2: APIs & Backend-for-Frontend (BFF)Criar rotas de API robustas (GET /api/dashboard/summary, GET /api/transactions).Criar a rota crítica de transferência (POST /api/transactions/transfer) utilizando Atomic Transactions do banco de dados para evitar inconsistência financeira.Instalar e implementar o Zod para validação severa de dados em todas as requisições (exigência básica de Big Techs).Phase 3: UI/UX & Frontend DevelopmentConstruir a tela de Login com formulários e validação Zod no front-end.Desenvolver o Layout Base (Sidebar de navegação corporativa e Header).Construir os Cards do Dashboard com opção de ocultar o saldo.Desenvolver o componente Stepper (formulário multi-etapas) para realizar transferências Pix/TED.Criar a tabela e o gráfico de alocação de investimentos.Phase 4: State Management & CachingInstalar o Zustand para gerenciar o estado da interface (ex: Sidebar aberta/fechada).Instalar o TanStack Query (React Query) para realizar cache de requisições de API, implementar Infinite Scroll no extrato bancário e Optimistic Updates.Phase 5: Software Quality & Automated TestingConfigurar ambiente de testes com Vitest ou Jest.Escrever Unit Tests para as funções críticas (ex: validar se a regra impede Pix sem saldo).Configurar Playwright ou Cypress para E2E Tests (simulando o usuário navegando na interface real).Phase 6: Enterprise Observability & CI/CDCriar tratamento global de erros utilizando o error.tsx do Next.js.Adicionar estados de carregamento elegantes utilizando o componente Skeleton.Criar uma pipeline no GitHub Actions (CI/CD) para rodar o Linter, o TypeScript Compiler e os testes de forma automatizada a cada commit.



Atue como um Desenvolvedor Full-Stack Sênior especialista em Next.js e meu proggessor,quero entender e aprender tudo, insira os códigos em inglês, só que converse comigo em português, e insira os links dos lugares que você pegou o modo de como fazer, estruturar e o motivo de cada bloco de código, (App Router), NextAuth v5 (Auth.js), Prisma e TypeScript. Tenho um projeto em andamento e preciso implementar um sistema de autenticação via Credenciais (CPF e Senha) com controle de rotas por Middleware e injeção de "roles" (cargos) na sessão.

Abaixo estão os requisitos arquiteturais, os códigos base que já validei e as tarefas que você deve executar para concluir o escopo de autenticação.



1. Arquitetura e Configurações Base

O projeto usa a separação recomendada pelo NextAuth v5 para rodar no Edge (Middleware). Temos a seguinte estrutura e os códigos já devem ser assumidos como corretos:

Arquivo routes.ts (Raiz do projeto):

Contém as constantes de rotas corrigidas.



TypeScript



export const publicRoutes: string[] = ["/"]export const authRoutes: string[] = ["/login", "/register"]export const apiAuthPrefix: string = "/api/auth" // Com a barra inicialexport const DEFAULT_LOGIN_REDIRECT: string = "/dashboard"

Arquivo auth.config.ts (Raiz do projeto):

Regras de credenciais e conexão com Prisma/Bcrypt.



TypeScript



import type { NextAuthConfig } from "next-auth";import CredentialsProvider from "next-auth/providers/credentials";import bcrypt from "bcryptjs";import { prisma } from "@/lib/prisma";export default {

    providers: [

        CredentialsProvider({

            name: "Credentials",

            credentials: {

                cpf: { label: 'CPF', type: 'text'},

                password: { label: 'Senha', type: 'password' }

            },

            async authorize(credentials) {

                if (!credentials?.cpf || !credentials?.password) return null;

                const user = await prisma.user.findUnique({

                    where: { cpf: String(credentials.cpf) }

                });

                if (!user || !user.passwordHash) return null;

                const isPasswordvalid = await bcrypt.compare(String(credentials.password), user.passwordHash);

                if (!isPasswordvalid) return null;

                return { id: user.id, name: user.name, email: user.email, role: user.role };

            }

        })

    ]

} satisfies NextAuthConfig;

Arquivo auth.ts (Raiz do projeto):

Inicialização e Callbacks para salvar ID e Role no token JWT.



TypeScript



import NextAuth from "next-auth";import authConfig from "./auth.config";export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({

    ...authConfig,

    session: { strategy: 'jwt' },

    callbacks: {

        async jwt({ token, user }) {

            if (user) token.role = user.role;

            return token;

        },

        async session({ session, token }) {

            if (token.sub && session.user) session.user.id = token.sub;

            if (token.role && session.user) session.user.role = token.role as string;

            return session;

        }

    },

    pages: { signIn: "/login" }

});

Arquivo middleware.ts (Raiz do projeto):

Controle de acesso isolado.



TypeScript



import NextAuth from "next-auth";import authConfig from "@/auth.config";import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";const { auth } = NextAuth(authConfig);export default auth((req) => {

    const { nextUrl } = req;

    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    const isAuthRoute = authRoutes.includes(nextUrl.pathname);



    if (isApiAuthRoute) return;

    if (isAuthRoute) {

        if (isLoggedIn) return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));

        return;

    }

    if (!isLoggedIn && !isPublicRoute) return Response.redirect(new URL("/login", nextUrl));

    return;

});export const config = { matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"] };

2. Tarefas a serem executadas

Com base nos códigos acima, gere as seguintes partes faltantes com as melhores práticas de mercado:



Tipagem do NextAuth: Crie o arquivo next-auth.d.ts na raiz do projeto estendendo a interface padrão do NextAuth para reconhecer o campo role no Session e no User.

Schema do Prisma: Crie o arquivo schema.prisma básico contendo o model User com os campos necessários (id, name, email, cpf único, passwordHash e role com um enum padrão).

Ação de Login (Server Action): Crie um arquivo actions/login.ts seguro para receber o CPF e Senha do formulário frontend, validar os dados (use Zod, se possível) e chamar a função signIn do NextAuth.

Interface de Login (Página): Crie a estrutura básica da página app/login/page.tsx contendo o formulário de CPF e Senha conectado à Server Action criada acima. Trate estados de erro básicos (ex: "Credenciais inválidas").

Mantenha o código limpo, comentado onde for estritamente necessário para decisões de arquitetura e focado em performance. Pode começar a gerar os códigos solicitados.