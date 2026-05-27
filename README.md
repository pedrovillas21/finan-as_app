# Finanças App

Projeto acadêmico de gestão financeira pessoal composto por dois módulos integrados:

- **`api-financas/`** — API REST em Node.js + Express + Prisma (SQLite) com autenticação JWT.
- **`financas_app/`** — Aplicativo mobile em React Native (Expo SDK 56) com Expo Router.

O usuário se cadastra/loga, registra suas receitas e despesas, organiza-as em categorias (fixas ou customizadas) e visualiza um resumo mensal com gráfico de pizza por categoria.

---

## 🗂️ Estrutura do Repositório

```
finan-as_app/
├── api-financas/              # Back-end (Express + Prisma + SQLite)
│   ├── prisma/                # schema, migrations e seed
│   ├── src/                   # config, controllers, middlewares, routes, validators
│   ├── postman/collection.json  # Collection v2.1 pronta para importar
│   └── .env.example
├── financas_app/              # Front-end (Expo + Expo Router)
│   ├── src/app/               # rotas (login, (auth)/index, (auth)/resumo)
│   ├── src/components/        # TransactionCard, TransactionModal, MonthYearFilter, CategoryPieChart…
│   ├── src/context/           # AuthContext, FinanceContext
│   ├── src/services/api.ts    # cliente Axios com interceptor JWT
│   └── .env.example
├── PLAN.md                    # Plano original do front-end
├── PLAN_BACK.md               # Plano original do back-end
├── PLAN_REGIS.md              # Plano da tela híbrida de Login/Registro
└── Plan_alinhamento.md        # Plano de alinhamento entre API e roteiro de testes
```

---

## 🧩 Processos realizados

### 1. Planejamento
Quatro planos foram elaborados antes da implementação, cada um documentando uma etapa:

1. **`PLAN.md`** — desenho da arquitetura do app mobile (Expo Router, contextos globais `AuthContext` e `FinanceContext`, fluxo de telas, gráficos de resumo, categorias customizadas).
2. **`PLAN_BACK.md`** — modelagem da API: camadas (rotas → controllers → validators), schema do Prisma (User / Category / Transaction), endpoints e validação com Zod.
3. **`PLAN_REGIS.md`** — tela híbrida Login/Registro com toggle dinâmico e integração de `signUp` no `AuthContext`.
4. **`Plan_alinhamento.md`** — ajuste de nomenclaturas (`amount` → `value`, novos campos `displayName`, `icon`, `background`, `isIncome` em `Category`) para alinhar com o roteiro de testes do professor.

### 2. Back-end (`api-financas/`)
- Inicialização do projeto com **TypeScript**, **Express 5**, **Prisma 5** e **SQLite**.
- Modelagem do banco em [api-financas/prisma/schema.prisma](api-financas/prisma/schema.prisma) com as entidades `User`, `Category` e `Transaction`.
- Geração de migrations e *seed* das categorias padrão ([api-financas/prisma/seed.ts](api-financas/prisma/seed.ts)).
- Estrutura de pastas em camadas:
  - [api-financas/src/config/](api-financas/src/config/) — instância única do Prisma Client.
  - [api-financas/src/controllers/](api-financas/src/controllers/) — regras de negócio (`auth`, `categories`, `transactions`).
  - [api-financas/src/routes/](api-financas/src/routes/) — definição dos endpoints.
  - [api-financas/src/middlewares/](api-financas/src/middlewares/) — `authenticate` (JWT) e `validate` (Zod).
  - [api-financas/src/validators/](api-financas/src/validators/) — schemas Zod para auth, categoria e transação.
- Hash de senha com **bcryptjs** e emissão de **JWT** no login/registro.
- Filtro server-side `GET /api/transactions?month=&year=` aceita `month` 1-12 e devolve apenas as transações do período do usuário autenticado.
- Rota raiz `GET /api` retornando `{ ok: true, name: "gestao-financeira-api" }` para o teste do roteiro.

#### Endpoints implementados

Todos os endpoints abaixo já estão implementados. A coluna **JWT** indica se a rota exige token de autenticação (✅ protegida) ou se é pública (❌ aberta).

| Método | Rota                       | JWT  | Descrição                                       |
|--------|----------------------------|------|-------------------------------------------------|
| POST   | `/api/auth/register`       | ❌   | Cadastro de usuário (rota pública)              |
| POST   | `/api/auth/login`          | ❌   | Login e emissão de JWT (rota pública)           |
| GET    | `/api/categories`          | ✅   | Lista categorias fixas + customizadas do user   |
| POST   | `/api/categories`          | ✅   | Cria categoria customizada                      |
| GET    | `/api/transactions`        | ✅   | Lista transações (filtros `?month=&year=`)      |
| POST   | `/api/transactions`        | ✅   | Cria nova receita/despesa                       |
| PUT    | `/api/transactions/:id`    | ✅   | Edita transação                                 |
| DELETE | `/api/transactions/:id`    | ✅   | Remove transação                                |

### 3. Front-end (`financas_app/`)
- Projeto **Expo SDK 56** com **Expo Router** (roteamento por arquivos).
- Fluxo de autenticação baseado em contextos:
  - [financas_app/src/context/AuthContext.tsx](financas_app/src/context/AuthContext.tsx) — `signIn`, `signUp`, `signOut`, persistência do token em `AsyncStorage`.
  - [financas_app/src/context/FinanceContext.tsx](financas_app/src/context/FinanceContext.tsx) — transações e categorias do usuário, com `setPeriod(month, year)` que dispara `GET /transactions?month=&year=` automaticamente; expõe `addTransaction`, `editTransaction`, `deleteTransaction` e `addCategory(displayName, isIncome)`.
- Tela híbrida de **Login / Cadastro** ([financas_app/src/app/login.tsx](financas_app/src/app/login.tsx)) com alternância dinâmica entre os modos.
- Grupo de rotas autenticadas ([financas_app/src/app/(auth)/](financas_app/src/app/(auth)/)):
  - `index.tsx` — Home com saudação personalizada, card de saldo, **gráfico de pizza** (donut) com despesas por categoria, filtro mês/ano e lista de transações do período.
  - `resumo.tsx` — Resumo mensal com barra empilhada e detalhamento percentual por categoria.
- Componentes reutilizáveis em [financas_app/src/components/](financas_app/src/components/):
  - [`TransactionCard`](financas_app/src/components/TransactionCard.tsx), [`TransactionModal`](financas_app/src/components/TransactionModal.tsx), [`MonthYearFilter`](financas_app/src/components/MonthYearFilter.tsx)
  - [`CategoryPieChart`](financas_app/src/components/CategoryPieChart.tsx) — donut em SVG puro, label central opcional (usado no Home).
- Cliente HTTP centralizado em [financas_app/src/services/api.ts](financas_app/src/services/api.ts) usando **Axios** com interceptor para injetar o JWT automaticamente.

#### Interações da UI
- **Adicionar transação:** botão flutuante (FAB) na Home abre o `TransactionModal` em modo criação.
- **Editar / excluir transação:** **toque longo** num card da lista abre o mesmo modal em modo edição, com botão "Salvar Alterações" e "Excluir Transação".
- **Filtro mês/ano:** o seletor no topo da Home e do Resumo dispara `setPeriod`, que recarrega a lista direto da API com os parâmetros `?month=&year=`.
- **Categorias por tipo:** o select dentro do modal filtra dinamicamente entre categorias de receita ou despesa, dependendo do toggle ativo, e exibe a cor de cada categoria em uma bolinha à esquerda do nome.
- **Categorias customizadas:** o botão "+ Nova Categoria" cria a categoria do tipo atual do toggle, com cor automaticamente atribuída de uma paleta rotativa.

### 4. Integração e alinhamento
- Padronização de nomenclatura entre back-end e front-end (`value`, `displayName`, `icon`, `background`, `isIncome`).
- Validação centralizada no servidor (Zod) garantindo que erros de payload retornem `400 Bad Request` antes de tocar o banco.
- Configuração de `EXPO_PUBLIC_API_URL` para apontar a base da API conforme o ambiente (emulador Android `10.0.2.2` ou IP da máquina para Expo Go físico).

---

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- npm
- Expo Go (no celular) ou um emulador Android/iOS

### 1) Back-end

```bash
cd api-financas
cp .env.example .env            # crie seu .env local e preencha os valores
npm install
npx prisma migrate dev          # cria o banco SQLite e aplica as migrations
npm run db:seed                 # popula as categorias padrão
npm run dev                     # sobe a API em http://localhost:3333
```

As variáveis necessárias estão documentadas em [api-financas/.env.example](api-financas/.env.example). Lembre de gerar um `JWT_SECRET` forte, por exemplo:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2) Front-end

```bash
cd financas_app
cp .env.example .env            # crie seu .env local e ajuste a URL da API
npm install
npm start                       # abre o Expo Dev Tools
```

A URL da API é lida de `EXPO_PUBLIC_API_URL` (veja [financas_app/.env.example](financas_app/.env.example)):
- Emulador Android: `http://10.0.2.2:3333/api`
- Dispositivo físico (Expo Go): `http://<IP-da-sua-máquina>:3333/api`

---

## 🧪 Testando a API

Há uma Collection do Postman pronta em [api-financas/postman/collection.json](api-financas/postman/collection.json):

1. No Postman: **Import** → selecione esse arquivo.
2. Suba a API (`npm run dev` em `api-financas/`).
3. Rode os requests na ordem das pastas: **Auth → Categories → Transactions**. Os test scripts já salvam `token`, `categoryId` e `transactionId` em variáveis da Collection, então não é preciso copiar/colar nada.
4. Para mudar a URL base (porta, host, IP), edite a variável `baseUrl` da Collection.

---

## 🧪 Stack técnica

**Back-end:** Node.js · TypeScript · Express 5 · Prisma 5 · SQLite · Zod · JWT · bcryptjs · CORS
**Front-end:** Expo SDK 56 · Expo Router · React Native 0.85 · React 19 · Axios · AsyncStorage · react-native-svg · TypeScript

---

## 📜 Licença

Veja [financas_app/LICENSE](financas_app/LICENSE).
