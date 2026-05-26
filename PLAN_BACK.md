🏗️ Estrutura de Pastas do Back-end
Uma arquitetura limpa dividida por camadas (Rotas, Controladores e Validações) para garantir uma nota excelente na organização do código:

Plaintext
api-financas/
├── src/
│   ├── config/          # Conexão com o banco (Prisma Client)
│   ├── controllers/     # Lógica de negócio (Auth, Transações, Categorias)
│   ├── middlewares/     # Validação de JWT e erros
│   ├── routes/          # Definição dos Endpoints
│   ├── validators/      # Esquemas de validação (Zod ou Yup)
│   └── server.ts        # Inicialização do Express
├── prisma/
│   └── schema.prisma    # Modelagem do Banco de Dados
├── .env                 # Variáveis de ambiente (Porta, JWT Secret)
└── package.json
🗄️ 1. Modelagem da Base de Dados (Prisma Schema)
Para atender aos requisitos de transações, categorias customizadas e usuários, a estrutura do banco precisa relacionar essas entidades. Cada transação pertence a um usuário e a uma categoria. Cada categoria pode ser global (do sistema) ou criada por um usuário específico.

Snippet de código
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(uuid())
  name         String
  email        String        @unique
  password     String
  createdAt    DateTime      @default(now())
  transactions Transaction[]
  categories   Category[]
}

model Category {
  id           String        @id @default(uuid())
  name         String
  color        String
  userId       String?       // Null significa que é uma das 5 categorias fixas padrão
  user         User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}

model Transaction {
  id          String   @id @default(uuid())
  description String
  amount      Float
  type        String   // "EXPENSE" ou "INCOME"
  date        DateTime
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
}
🛣️ 2. Endpoints e Rotas do Servidor
A API será estruturada com os seguintes endpoints restritos por um middleware de autenticação JWT:

Autenticação (Rotas Públicas)
POST /api/auth/register → Cadastro de usuário.

POST /api/auth/login → Validação de e-mail/senha e geração do Token JWT.

Categorias (Rotas Protegidas)
GET /api/categories → Retorna as 5 fixas + as customizadas do usuário logado.

POST /api/categories → Cria uma nova categoria atrelada ao userId.

Transações (Rotas Protegidas)
GET /api/transactions?month=X&year=Y → Lista filtrada por mês/ano do usuário logado.

POST /api/transactions → Cria uma nova receita ou despesa.

PUT /api/transactions/:id → Edita uma transação existente.

DELETE /api/transactions/:id → Exclui uma transação.

🛡️ 3. Validação no Servidor
Usaremos o Zod no back-end para garantir que nenhuma informação inválida quebre o banco. Se o front-end esquecer de mandar o amount ou mandar uma data no formato errado, o servidor barra a requisição no middleware de validação e retorna um erro 400 Bad Request.

📲 4. Integração no Front-end (Expo)
No seu aplicativo Expo SDK 56, faremos a transição da memória local para a API externa:

Criação do API Client HTTP
Criaremos um arquivo em src/services/api.ts utilizando a biblioteca Axios. Ele será configurado para injetar automaticamente o Token JWT em todas as requisições após o login.

TypeScript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  // Se for testar no Android Emulator, use 10.0.2.2. Se for no iOS ou Expo Go (físico), use o IP da sua máquina.
  baseURL: 'http://10.0.2.2:3333/api', 
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@FinancasApp:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
Substituição dos Contextos
AuthContext.tsx: Em vez de validar localmente, a função signIn chama api.post('/auth/login'), guarda o token retornado no AsyncStorage e o nome do usuário no estado.

FinanceContext.tsx: As funções que antes faziam .push() ou .filter() no array em memória agora farão chamadas assíncronas: api.get('/transactions'), api.post('/transactions'), etc., disparando um refresh dos dados logo em seguida.