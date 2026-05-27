import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  background: string;
  isIncome: boolean;
};

export type Transaction = {
  id: string;
  description: string;
  value: number;
  type: TransactionType;
  category: string;           // displayName da categoria (para exibição)
  categoryBackground: string; // background da categoria (para visual)
  categoryId: string;
  date: string;
};

type TransactionInput = Omit<Transaction, 'id' | 'categoryId' | 'categoryBackground'>;

type FinanceContextType = {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  setPeriod: (month: number, year: number) => void; // month: 0-11 (JS Date)
  refresh: () => Promise<void>;
  addTransaction: (t: TransactionInput) => Promise<void>;
  editTransaction: (id: string, partial: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (displayName: string, isIncome: boolean) => Promise<void>;
};

const FinanceContext = createContext<FinanceContextType | null>(null);

function mapTransaction(raw: Record<string, any>): Transaction {
  return {
    id: raw.id,
    description: raw.description,
    value: raw.value,
    type: raw.type as TransactionType,
    category: raw.category?.displayName ?? raw.category?.name ?? raw.categoryId,
    categoryBackground: raw.category?.background ?? '#A0A0A0',
    categoryId: raw.categoryId,
    date: raw.date,
  };
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions]     = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]               = useState(false);
  const today = new Date();
  const [period, setPeriodState] = useState<{ month: number; year: number }>({
    month: today.getMonth(),
    year:  today.getFullYear(),
  });

  useEffect(() => {
    if (user) {
      loadCategories();
    } else {
      setTransactions([]);
      setCategories([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) loadTransactions(period.month, period.year);
  }, [user?.id, period.month, period.year]);

  async function loadCategories() {
    try {
      const catRes = await api.get('/categories');
      setCategories(catRes.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as categorias.');
    }
  }

  async function loadTransactions(month: number, year: number) {
    setLoading(true);
    try {
      // O back-end espera o mês 1-12; o estado interno usa 0-11 (padrão JS Date)
      const txRes = await api.get('/transactions', {
        params: { month: month + 1, year },
      });
      setTransactions(txRes.data.map(mapTransaction));
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as transações.');
    } finally {
      setLoading(false);
    }
  }

  function setPeriod(month: number, year: number) {
    setPeriodState({ month, year });
  }

  async function refresh() {
    await Promise.all([loadCategories(), loadTransactions(period.month, period.year)]);
  }

  async function addTransaction(t: TransactionInput) {
    const cat = categories.find((c) => c.displayName === t.category);
    if (!cat) {
      Alert.alert('Erro', 'Categoria não encontrada.');
      return;
    }
    try {
      await api.post('/transactions', {
        description: t.description,
        value: t.value,
        type: t.type,
        date: t.date,
        categoryId: cat.id,
      });
      await loadTransactions(period.month, period.year);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a transação.');
    }
  }

  async function editTransaction(id: string, partial: Partial<TransactionInput>) {
    const payload: Record<string, unknown> = {};
    if (partial.description !== undefined) payload.description = partial.description;
    if (partial.value       !== undefined) payload.value       = partial.value;
    if (partial.type        !== undefined) payload.type        = partial.type;
    if (partial.date        !== undefined) payload.date        = partial.date;
    if (partial.category    !== undefined) {
      const cat = categories.find((c) => c.displayName === partial.category);
      if (!cat) {
        Alert.alert('Erro', 'Categoria não encontrada.');
        return;
      }
      payload.categoryId = cat.id;
    }
    try {
      await api.put(`/transactions/${id}`, payload);
      await loadTransactions(period.month, period.year);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a transação.');
    }
  }

  async function deleteTransaction(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      await loadTransactions(period.month, period.year);
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir a transação.');
    }
  }

  async function addCategory(displayName: string, isIncome: boolean) {
    const trimmed = displayName.trim();
    if (!trimmed) return;

    // slug ASCII, sem acentos/espaços, para o campo `name`
    const slug = trimmed
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // paleta rotativa para o background da nova categoria
    const palette = ['#FFB6B6', '#B6DBFF', '#B6FFC4', '#FFE5B6', '#D9B6FF', '#FFB6E5', '#B6FFEE'];
    const background = palette[categories.length % palette.length];

    try {
      await api.post('/categories', {
        name: slug || trimmed,
        displayName: trimmed,
        icon: 'label',
        background,
        isIncome,
      });
      const catRes = await api.get('/categories');
      setCategories(catRes.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a categoria.');
    }
  }

  return (
    <FinanceContext.Provider
      value={{ transactions, categories, loading, setPeriod, refresh, addTransaction, editTransaction, deleteTransaction, addCategory }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
