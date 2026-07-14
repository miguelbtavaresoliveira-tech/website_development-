# ApexBank - Contexto do Projeto e Roadmap

🏢 1. Project Overview
Project Name: ApexBank
Description: A high-performance Open Finance and investment management dashboard.
Target Audience: Recruiters and engineering managers at Big Techs and major financial institutions.
Language Standard: English strictly applied to all code, variables, database columns, commits, and inline comments.

🛠️ 2. Tech Stack & Dependencies Installed
Layer | Technology / Library | Purpose
--- | --- | ---
Framework | Next.js (App Router) | React framework for server-side rendering and API routes.
Language | TypeScript | Static typing to prevent runtime errors.
Styling | Tailwind CSS | Utility-first CSS framework for rapid UI development.
UI Components | Shadcn/ui | Accessible, customizable components (Button, Input, Card, Dialog).
Icons & Fonts | Lucide Icons / Geist Font | Enterprise-grade visual identity and typography.
Database | MySQL | Relational database.
ORM | @prisma/client & prisma (v7.8.0) | Database mapping and type-safe query builder.
Authentication | next-auth@beta (Auth.js) | Complete authentication lifecycle and session management.
Security | bcryptjs & @types/bcryptjs | Cryptographic hashing for user passwords.

🏗️ 3. Software Architecture & Patterns
- **Database First Approach**: Prisma mapeia tabelas `snake_case` do MySQL nativo para o padrão `camelCase` do TypeScript utilizando a diretriz `@map`.
- **Singleton Pattern**: Implementado em `src/lib/prisma.ts` para evitar que o Next.js abra múltiplas conexões com o MySQL durante o Hot Reloading. Suporte nativo para o Prisma 7 sem a propriedade deprecada `url` direto no `schema.prisma`.
- **Edge Computing Security**: O arquivo `src/middleware.ts` bloqueia requisições não autorizadas diretamente no nível global Edge.
- **Stateless JWT Sessions**: O nível de acesso (role) e o ID são embutidos e assinados em JWT via `auth.ts`, não consumindo memória e mantendo a escalabilidade.
- **Centralized Routing**: `src/routes.ts` atua como fonte da verdade (SSOT) evitando "magic strings" e gerindo as restrições globais de rotas.

🗄️ 4. Database Schema (MySQL)
Modelado com foco em precisão financeira.
- **Users**: id (UUID), name, email, cpf, password_hash, role (STANDARD_CLIENT, PREMIUM_CLIENT, ADMIN), created_at, updated_at.
- **Accounts**: id (UUID), user_id, account_number, balance (DECIMAL 15,2), account_type (CHECKING, SAVINGS), created_at.
- **Transactions**: id (UUID), sender_account_id, receiver_account_id, amount (DECIMAL 15,2), transaction_type (PIX, TED, DEPOSIT, PAYMENT), description, created_at.
- **Investments**: id (UUID), user_id, asset_ticker, quantity (DECIMAL 10,4), purchase_price (DECIMAL 15,2), created_at.

✅ 5. What is Already Done (Foundation) - Detalhado e Concluído
1. **Estruturação de Repositório & UI**: Criação do projeto Next.js (App Router) com integração completa do Tailwind CSS e inicialização do ecossistema Shadcn/ui.
2. **Setup do Banco de Dados & Prisma**: 
   - Configuração de credenciais (`DATABASE_URL`) no cofre de variáveis `.env`.
   - Resolução e adequação da arquitetura do Prisma 7 (`url` removida do `schema.prisma` e parametrizada adequadamente via `prisma.config.ts`).
   - Geração com sucesso do Prisma Client, garantindo a integridade dos dados e tipagem estrita de tabelas/colunas.
3. **Módulo de Autenticação Segura (Auth.js v5)**:
   - Resolução de conflitos e duplicações sintáticas estruturais no `src/auth.ts`.
   - Configuração do **CredentialsProvider** customizado com `bcrypt.compare` em `auth.config.ts` para verificar hashes seguros no banco de dados.
   - Callbacks JWT e de Sessão otimizados: JWT intercepta e salva o ID e `role` original do banco; a sessão puxa o ID/role de volta na serialização para o front-end. Assim, o backend nunca precisa consultar o banco novamente para descobrir o cargo em cada refresh da página.
   - Resolução assertiva de tipagem TypeScript injetando `token.role` no objeto de sessão global com segurança em `src/next-auth.d.ts`.
4. **Middlewares de Restrição de Acesso**:
   - Definição em `middleware.ts` mapeando rigorosamente `apiAuthPrefix`, `authRoutes` (ex: `/login`) e `publicRoutes`.
   - Redirecionamentos lógicos executados antes mesmo de encostar no framework React (Bloqueio total de invasões no front).
5. **Server Actions de Login Inicial**:
   - Server Action criada e limpa `src/actions/login.ts`, chamando `signIn()` direto no lado do servidor.
   - Configurado o direcionador de escape assíncrono validando com exatidão a função `isRedirectError` importada das entranhas corretas do Next.js 15 (`next/dist/client/components/redirect-error`).
6. **Interface Básica de Login**:
   - Interface visual `src/app/(auth)/login/page.tsx` construída, já engatada ao mecanismo de `useTransition` do React para proteger multiplas requisições simultâneas durante a autenticação.

🗺️ 6. Roadmap: What is Left to Build (Backlog do Futuro)
Fase prioritária focada em demonstrar padrões de Engenharia de Software ao recrutador.

**Fase 1: Refinamento e Validação Client-Side (Imediato)**
- [ ] Criar a pasta arquitetural `src/schemas` e centralizar esquemas do Zod (como `LoginSchema`). O intuito é promover a "Única Fonte da Verdade", para o Frontend e Backend utilizarem o mesmo esquema validatório.
- [ ] Instalar as bibliotecas ausentes: `zod`, `react-hook-form` e `@hookform/resolvers`.
- [ ] Refatorar a UI de Login utilizando o componente controlado `<Form>` do Shadcn. A requisição será impedida de trafegar sem que as máscaras de CPF e tamanhos exatos de senha obedeçam a política do front.

**Fase 2: Motor Financeiro de Transações (BFF & Banco)**
- [ ] Criar a rota crítica `POST /api/transactions/transfer`. Trilha clássica de sabatina corporativa, exigindo o uso de **Atomic Transactions** (`prisma.$transaction`) a fim de evitar `Race Conditions`. Garantir de que o dinheiro nunca saia da origem se o destino falhar.
- [ ] Construir Rota de Resumo da Conta `GET /api/dashboard/summary` que devolverá de forma consolidada os dados cruzados das tabelas Account/Investments de maneira veloz.

**Fase 3: Construção UI/UX do Dashboard Administrativo**
- [ ] Criar o layout raiz corporativo `src/app/dashboard/layout.tsx`. Terá uma Sidebar retrátil rica e um Navigation Header moderno.
- [ ] Desenvolver Componentes Modulares de Finanças como _Cards_ de resumo (com funcionalidade tipo "olho mágico" para obscurecer saldos financeiros por privacidade).
- [ ] Componente _Stepper_ UI de alta fluidez para guiar o usuário em transferências via TED ou PIX.
- [ ] Visão Gráfica interativa de investimentos utilizando um plugin especializado do Recharts atrelado a tipografia Geist.

**Fase 4: State Management & Client Caching**
- [ ] Injetar o Zustand na arquitetura global para gerenciar estados sincrônicos no cliente de forma barata (ex: persistir se o sidebar deve abrir minimizado por preferência do cliente).
- [ ] Instalar `@tanstack/react-query` providenciando estratégias pesadas de paginação infinita e stale-while-revalidate, desafogando o servidor ao transitar pelos extratos bancários.

**Fase 5: Automação, Observabilidade e CI/CD**
- [ ] Implementar componentes interceptadores do Next.js nativo `error.tsx` e `loading.tsx` provendo feedback de esqueleto (Skeletons) durante o streamings.
- [ ] Instalar ambiente de Testes Unitários e Integrados utilizando o `vitest` isolado. Os testes deverão garantir de maneira autônoma regras cruciais de negócio (Testes onde CPF inválido ou Transferência Maior Que O Saldo lancem erros imediatamente).
- [ ] Estruturar uma trilha de Continuous Integration (`.github/workflows/main.yml`) que force toda futura Pull Request a rodar Linters, TypeScript e Testes impiedosamente antes de liberar qualquer Deploy.