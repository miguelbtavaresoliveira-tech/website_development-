# 🍔 Minha Hamburgueria

Aplicação fullstack de gerenciamento de uma hamburgueria artesanal, construída com **Next.js 16**, **TypeScript** e **MySQL**.

---

## 🚀 Tech Stack

| Camada       | Tecnologia               |
|--------------|--------------------------|
| Framework    | Next.js 16 (App Router)  |
| Linguagem    | TypeScript 5             |
| Estilização  | Vanilla CSS + Design Tokens |
| Banco de Dados | MySQL 8 (via mysql2)   |
| Runtime      | Node.js 20+              |

---

## 📁 Estrutura de Pastas

```
src/
├── app/                  # App Router (páginas e API routes)
│   ├── api/              # API Routes (server-side)
│   │   ├── pedidos/      # GET /api/pedidos, POST /api/pedidos
│   │   └── produtos/     # GET /api/produtos
│   ├── pedidos/          # Página /pedidos
│   ├── globals.css       # Design system (tokens CSS globais)
│   ├── layout.tsx        # Layout raiz (Header + Footer)
│   └── page.tsx          # Página Home (/)
│
├── components/
│   ├── ui/               # Componentes primitivos (Button, Input, Modal…)
│   ├── layout/           # Header, Footer
│   └── features/         # Componentes de domínio (PedidoCard, ProdutoCard…)
│
├── lib/
│   ├── db.ts             # Pool de conexão MySQL (só servidor)
│   └── utils.ts          # Funções utilitárias (formatadores, helpers)
│
├── services/             # Camada de acesso a dados (só servidor)
│   ├── pedidoService.ts
│   └── produtoService.ts
│
├── hooks/                # Custom React Hooks (só cliente)
│   └── usePedidos.ts
│
├── types/                # TypeScript interfaces e types
│   ├── pedido.ts
│   ├── produto.ts
│   └── index.ts          # Barrel de exports
│
└── constants/
    └── index.ts          # Rotas, status, paginação
```

---

## ⚙️ Setup Local

### 1. Pré-requisitos

- Node.js 20+
- MySQL 8+ rodando localmente

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local` com suas credenciais de banco de dados.

### 4. Criar o banco de dados

```sql
CREATE DATABASE sua_hamburgueria;
```

> Rode os scripts SQL da sua migration para criar as tabelas.

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 🛠 Scripts Disponíveis

| Comando         | O que faz                            |
|-----------------|--------------------------------------|
| `npm run dev`   | Inicia servidor de desenvolvimento   |
| `npm run build` | Gera build de produção               |
| `npm start`     | Inicia servidor de produção          |
| `npm run lint`  | Executa ESLint no código             |

---

## 🏛️ Convenções do Projeto

### Path Aliases (TypeScript)

Use sempre os aliases configurados no `tsconfig.json`:

```typescript
// ✅ Correto
import { Button } from "@/components/ui";
import { listarPedidos } from "@/services/pedidoService";
import type { Pedido } from "@/types";

// ❌ Evitar
import { Button } from "../../components/ui/Button";
```

### Server vs. Client Components

| Arquivo/pasta | Onde roda |
|---|---|
| `src/lib/db.ts` | **Somente servidor** |
| `src/services/` | **Somente servidor** |
| `src/app/api/` | **Somente servidor** |
| `src/hooks/` | **Somente cliente** (`"use client"`) |
| `src/components/ui/` | Ambos (sem "use client" = servidor por padrão) |

---

## 🗂️ API Routes

| Método | Rota             | Descrição                   |
|--------|------------------|-----------------------------|
| GET    | `/api/pedidos`   | Lista todos os pedidos      |
| POST   | `/api/pedidos`   | Cria um novo pedido         |
| GET    | `/api/produtos`  | Lista todos os produtos     |
| POST   | `/api/produtos`  | Cria um novo produto        |
