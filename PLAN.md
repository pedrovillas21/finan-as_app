🗺️ Estrutura de Pastas Sugerida
Uma estrutura simples baseada em arquivos (app/) para o Expo Router, mantendo o código limpo:

Plaintext
meu-app-financas/
├── app/                  # Rotas e Telas (Expo Router)
│   ├── (auth)/           # Grupo de rotas autenticadas
│   │   ├── _layout.jsx   # Tab navigation (Abas: Home, Resumo)
│   │   ├── index.jsx     # Tela Principal (Home / Lista)
│   │   └── resumo.jsx    # Tela de Resumo com Gráficos
│   ├── login.jsx         # Tela de Login (Fora da autenticação)
│   └── _layout.jsx       # Root layout (Gerencia o fluxo de Login vs App)
├── src/                  # Componentes e Lógica reutilizável
│   ├── components/       # Modais, Filtros, Cards
│   ├── context/          # AuthContext e FinanceContext (Estado Global)
│   └── constants/        # Categorias fixas, Cores
└── package.json
📝 Plano de Integração e Desenvolvimento
Passo 1: Configuração do Estado Global e Autenticação Fictícia
Como o professor pediu tela de login com validação e mensagem de boas-vindas, criaremos dois Contextos na pasta src/context/:

AuthContext.jsx: Guarda o estado do usuário logado (ex: user: { name: 'Fulano' }) e as funções de signIn e signOut.

FinanceContext.jsx: Guarda a lista de transações (Array de objetos), as categorias customizadas e as funções de addTransaction, editTransaction e deleteTransaction.

Passo 2: Fluxo de Navegação (app/_layout.jsx)
O arquivo raiz vai escutar o AuthContext. Se o usuário estiver logado, ele renderiza o grupo (auth). Se não, ele redireciona para a tela de login.jsx.

Passo 3: Implementação das Telas e Requisitos do Professor
1. Tela de Login (app/login.jsx)
Inputs simples de e-mail e senha.

Validação básica (ex: se não for vazio, ou uma senha fixa para teste acadêmico).

Ao logar, salva o nome do usuário no contexto e navega para o app.

4. Tela Principal / Lista (app/(auth)/index.jsx)
Mensagem de boas-vindas: Resgata o nome do usuário do AuthContext (ex: "Olá, João!").

Lista de Transações: FlatList exibindo os itens.

Filtro Mês/Ano: Um componente no topo (pode ser um modal ou um seletor horizontal simples) que filtra o array de transações antes de renderizar.

Toque Longo (Edição/Exclusão): Usar o componente TouchableOpacity com a propriedade onLongPress em cada item da lista. Ele abrirá um Modal com as opções de editar os campos ou excluir a transação.

5. Tela de Resumo (app/(auth)/resumo.jsx)
Filtro Mês/Ano: O mesmo componente de filtro reutilizado aqui.

Gráfico de Pizza: Para não complicar a instalação de bibliotecas pesadas de gráficos nativos, a recomendação padrão para Expo é usar a react-native-svg-charts ou a react-native-chart-kit. Elas resolvem o gráfico de pizza de forma rápida passando apenas o array de dados filtrados por categoria.

6. Categorias Customizadas
No modal de criação/edição de transação, além do select com as 5 categorias fixas do professor, haverá um botão "+ Nova Categoria".

Isso adicionará a nova string ao array de categorias dentro do FinanceContext, ficando disponível imediatamente para os próximos lançamentos.