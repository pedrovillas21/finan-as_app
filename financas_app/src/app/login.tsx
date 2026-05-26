import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const theme = useTheme();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function toggleMode() {
    setIsRegistering((v) => !v);
    setName('');
    setError('');
  }

  async function handleAction() {
    setError('');
    if (!email.trim() || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (isRegistering) {
      if (name.trim().length < 2) {
        setError('O nome deve ter ao menos 2 caracteres.');
        return;
      }
      const ok = await signUp(name.trim(), email.trim(), password);
      if (!ok) {
        setError('Não foi possível criar a conta. E-mail já cadastrado?');
        return;
      }
    } else {
      const ok = await signIn(email.trim(), password);
      if (!ok) {
        setError('E-mail ou senha incorretos.');
        return;
      }
    }
    // AuthGuard só redireciona quando !user && inAuthGroup — não reage ao login.
    router.replace('/(auth)');
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      borderColor: theme.backgroundSelected,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.form}
        >
          <ThemedText type="title" style={styles.title}>
            💰 Finanças
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
            {isRegistering ? 'Crie sua conta' : 'Faça login para continuar'}
          </ThemedText>

          <View style={styles.inputs}>
            {isRegistering && (
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setError('');
                }}
                placeholder="Seu nome"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setError('');
              }}
              placeholder="E-mail"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={inputStyle}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setError('');
              }}
              placeholder="Senha (mín. 6 caracteres)"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />
            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleAction} activeOpacity={0.8}>
            <ThemedText type="smallBold" style={styles.loginBtnText}>
              {isRegistering ? 'Cadastrar' : 'Entrar'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} activeOpacity={0.7} style={styles.toggleBtn}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
              {isRegistering
                ? 'Já tem uma conta? Faça Login'
                : 'Não tem uma conta? Cadastre-se'}
            </ThemedText>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'center' },
  form: {
    paddingHorizontal: 28,
    gap: 20,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: -8,
  },
  inputs: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  hint: {
    textAlign: 'center',
  },
  toggleBtn: {
    alignItems: 'center',
  },
});
