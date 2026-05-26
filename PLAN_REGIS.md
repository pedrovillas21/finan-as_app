📋 Plano de Implementação: Tela Híbrida (Login + Registro)1. Modificações no Estado Local (app/login.jsx)Para fazer a alternância, precisamos de um novo estado booleano e um campo extra para o nome do usuário (já que o registro exige o nome, enquanto o login precisa apenas de e-mail e senha).isRegistering (boolean): Controla se a tela está no modo "Entrar" (false) ou no modo "Criar Conta" (true).name (string): Campo de texto que só ficará visível se isRegistering for verdadeiro.2. Mudanças na Interface (UI Dinâmica)Campo "Nome": Renderizado condicionalmente. Se isRegistering for true, o input de nome aparece com uma animação simples ou transição suave.Texto do Botão Principal: * Se isRegistering for false $\rightarrow$ "Entrar"Se isRegistering for true $\rightarrow$ "Cadastrar"O Alternador (Toggle): Um botão de texto simples na parte inferior da tela.Se estiver em modo Login: "Não tem uma conta? Cadastre-se"Se estiver em modo Cadastro: "Já tem uma conta? Faça Login"3. Integração com o AuthContext e APIAtualmente, o seu AuthContext provavelmente só possui a função signIn. Vamos garantir que o fluxo de registro funcione perfeitamente disparando a chamada correta para a API.No AuthContext.tsx:Adicionaremos a função signUp para conversar com o back-end:TypeScript// Assinatura da função dentro do AuthContext
signUp: (name: string, email: string, password: string) => Promise<void>;
Fluxo da função signUp:Envia um POST para /auth/register com { name, email, password }.O servidor valida via Zod, cria o usuário no SQLite, gera o JWT e retorna os dados.Para poupar o usuário de ter que logar de novo logo após se cadastrar, a própria função signUp já pode salvar o token/usuário no AsyncStorage e atualizar o estado global, jogando o usuário direto para dentro do app.Na lógica do Botão na Tela de Login:A função que dispara o formulário (handleSubmit) vai validar os campos dinamicamente:JavaScriptconst handleAction = async () => {
  if (!email || !password) {
    return Alert.alert("Erro", "Preencha todos os campos.");
  }

  if (isRegistering) {
    if (!name) return Alert.alert("Erro", "Preencha o campo Nome.");
    
    // Fluxo de Cadastro
    try {
      await signUp(name, email, password);
    } catch (error) {
      Alert.alert("Erro no Cadastro", "Não foi possível criar a conta.");
    }
  } else {
    // Fluxo de Login Tradicional
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert("Erro no Login", "E-mail ou senha inválidos.");
    }
  }
};