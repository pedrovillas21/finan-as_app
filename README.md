# Finanças App

Projeto acadêmico de gestão financeira pessoal composto por dois módulos integrados:

- **`api-financas/`** — API REST em Node.js + Express + Prisma (SQLite) com autenticação JWT.
- **`financas_app/`** — Aplicativo mobile em React Native (Expo SDK 56) com Expo Router.

O usuário se cadastra/loga, registra suas receitas e despesas, organiza-as em categorias (fixas ou customizadas) e visualiza um resumo mensal com gráfico.

---

## 🗂️ Estrutura do Repositório

```
finan-as_app/
├── api-financas/        # Back-end (Express + Prisma + SQLite)
├── financas_app/        # Front-end (Expo + Expo Router)
├── PLAN.md              # Plano original do front-end
├── PLAN_BACK.md         # Plano original do back-end
├── PLAN_REGIS.md        # Plano da tela híbrida de Login/Registro
└── Plan_alinhamento.md  # Plano de alinhamento entre API e roteiro de testes
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
- Rota raiz `GET /api` retornando `{ ok: true, name: "gestao-financeira-api" }` para o teste do roteiro.

#### Endpoints implementados

| Método | Rota                       | Auth | Descrição                                       |
|--------|----------------------------|------|-------------------------------------------------|
| POST   | `/api/auth/register`       | ❌   | Cadastro de usuário                             |
| POST   | `/api/auth/login`          | ❌   | Login e emissão de JWT                          |
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
  - [financas_app/src/context/FinanceContext.tsx](financas_app/src/context/FinanceContext.tsx) — transações e categorias do usuário logado, sincronizadas com a API.
- Tela híbrida de **Login / Cadastro** ([financas_app/src/app/login.tsx](financas_app/src/app/login.tsx)) com alternância dinâmica entre os modos.
- Grupo de rotas autenticadas ([financas_app/src/app/(auth)/](financas_app/src/app/(auth)/)):
  - `index.tsx` — Home com saudação personalizada, lista de transações e filtro mês/ano.
  - `resumo.tsx` — Resumo mensal com gráfico por categoria.
- Componentes reutilizáveis em [financas_app/src/components/](financas_app/src/components/): `TransactionCard`, `TransactionModal`, `MonthYearFilter`, abas etc.
- Cliente HTTP centralizado em [financas_app/src/services/api.ts](financas_app/src/services/api.ts) usando **Axios** com interceptor para injetar o JWT automaticamente.
- Toque longo em uma transação abre modal de **edição/exclusão**.
- Suporte a **categorias customizadas** criadas pelo usuário durante o lançamento.

### 4. Integração e alinhamento
- Padronização de nomenclatura entre back-end e front-end (`value`, `displayName`, `icon`, `background`, `isIncome`).
- Validação centralizada no servidor (Zod) garantindo que erros de payload retornem `400 Bad Request` antes de tocar o banco.
- Configuração de `baseURL` da API para funcionar tanto em emulador Android (`10.0.2.2`) quanto em dispositivo físico (IP local da máquina).

---

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- npm
- Expo Go (no celular) ou um emulador Android/iOS

### 1) Back-end

```bash
cd api-financas
npm install
npx prisma migrate dev          # cria o banco SQLite e aplica as migrations
npm run db:seed                 # popula as categorias padrão
npm run dev                     # sobe a API em http://localhost:3333
```

Variáveis em `api-financas/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
PORT=3333
```

### 2) Front-end

```bash
cd financas_app
npm install
npm start                       # abre o Expo Dev Tools
```

Ajuste a `baseURL` em [financas_app/src/services/api.ts](financas_app/src/services/api.ts) conforme o ambiente:
- Emulador Android: `http://10.0.2.2:3333/api`
- Dispositivo físico (Expo Go): `http://<IP-da-sua-máquina>:3333/api`

---

## 🧪 Stack técnica

**Back-end:** Node.js · TypeScript · Express 5 · Prisma 5 · SQLite · Zod · JWT · bcryptjs · CORS
**Front-end:** Expo SDK 56 · Expo Router · React Native 0.85 · React 19 · Axios · AsyncStorage · TypeScript

---

## 📜 Licença

Veja [financas_app/LICENSE](financas_app/LICENSE).
