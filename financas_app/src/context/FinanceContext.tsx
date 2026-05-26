import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type TransactionType = 'income' | 'expense';

type Category = {
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
  categories: string[];
  loading: boolean;
  addTransaction: (t: TransactionInput) => Promise<void>;
  editTransaction: (id: string, partial: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
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
  const [categoryObjects, setCategoryObjects] = useState<Category[]>([]);
  const [loading, setLoading]               = useState(false);

  const categories = categoryObjects.map((c) => c.displayName);

  useEffect(() => {
    if (user) {
      loadAll();
    } else {
      setTransactions([]);
      setCategoryObjects([]);
    }
  }, [user?.id]);

  async function loadAll() {
    setLoading(true);
    try {
      const [catRes, txRes] = await Promise.all([
        api.get('/categories'),
        api.get('/transactions'),
      ]);
      setCategoryObjects(catRes.data);
      setTransactions(txRes.data.map(mapTransaction));
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(t: TransactionInput) {
    const cat = categoryObjects.find((c) => c.displayName === t.category);
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
      await loadAll();
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
      const cat = categoryObjects.find((c) => c.displayName === partial.category);
      if (!cat) {
        Alert.alert('Erro', 'Categoria não encontrada.');
        return;
      }
      payload.categoryId = cat.id;
    }
    try {
      await api.put(`/transactions/${id}`, payload);
      await loadAll();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a transação.');
    }
  }

  async function deleteTransaction(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      await loadAll();
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir a transação.');
    }
  }

  async function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await api.post('/categories', { name: trimmed });
      const catRes = await api.get('/categories');
      setCategoryObjects(catRes.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a categoria.');
    }
  }

  return (
    <FinanceContext.Provider
      value={{ transactions, categories, loading, addTransaction, editTransaction, deleteTransaction, addCategory }}
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
