import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/AuthContext';
import { Transaction, useFinance } from '@/context/FinanceContext';
import { MonthYearFilter } from '@/components/MonthYearFilter';
import { TransactionCard } from '@/components/TransactionCard';
import { TransactionModal } from '@/components/TransactionModal';
import { CategoryPieChart, PieSlice } from '@/components/CategoryPieChart';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { transactions, setPeriod } = useFinance();
  const theme = useTheme();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // transactions já vem filtrado do back-end via ?month=&year=
  const filtered = transactions;

  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.value, 0);
  const expense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);
  const balance = income - expense;
  const balanceColor = balance >= 0 ? '#fff' : '#FFEAA7';

  const expensesByCategory = filtered
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, { amount: number; background: string }>>((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { amount: 0, background: t.categoryBackground };
      }
      acc[t.category].amount += t.value;
      return acc;
    }, {});

  const pieSlices: PieSlice[] = Object.entries(expensesByCategory)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([cat, { amount, background }]) => ({
      key: cat,
      label: cat,
      value: amount,
      color: background,
    }));

  function openAdd() {
    setSelectedTransaction(null);
    setModalVisible(true);
  }

  function openEdit(t: Transaction) {
    setSelectedTransaction(t);
    setModalVisible(true);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              Bem-vindo(a),
            </ThemedText>
            <ThemedText type="subtitle">{user?.name} 👋</ThemedText>
          </View>
          <TouchableOpacity
            onPress={signOut}
            style={[styles.logoutBtn, { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText type="small" themeColor="textSecondary">
              Sair
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <ThemedText type="small" style={styles.balanceLabelText}>
            Saldo do mês
          </ThemedText>
          <ThemedText type="title" style={[styles.balanceValue, { color: balanceColor }]}>
            {formatCurrency(balance)}
          </ThemedText>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ThemedText type="small" style={styles.balanceLabelText}>
                ↑ Receitas
              </ThemedText>
              <ThemedText type="smallBold" style={styles.balanceAmountText}>
                {formatCurrency(income)}
              </ThemedText>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <ThemedText type="small" style={styles.balanceLabelText}>
                ↓ Despesas
              </ThemedText>
              <ThemedText type="smallBold" style={styles.balanceAmountText}>
                {formatCurrency(expense)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Pie chart: despesas por categoria */}
        {pieSlices.length > 0 && (
          <View style={[styles.pieCard, { backgroundColor: theme.backgroundElement }]}>
            <CategoryPieChart
              slices={pieSlices}
              size={140}
              centerLabel="Despesas"
              centerValue={formatCurrency(expense)}
            />
            <View style={styles.legend}>
              <ThemedText type="smallBold" style={styles.legendTitle}>
                Por categoria
              </ThemedText>
              {pieSlices.slice(0, 4).map((s) => {
                const pct = expense > 0 ? Math.round((s.value / expense) * 100) : 0;
                return (
                  <View key={s.key} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <ThemedText type="small" style={styles.legendLabel} numberOfLines={1}>
                      {s.label}
                    </ThemedText>
                    <ThemedText type="smallBold">{pct}%</ThemedText>
                  </View>
                );
              })}
              {pieSlices.length > 4 && (
                <ThemedText type="small" themeColor="textSecondary">
                  +{pieSlices.length - 4} outras
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {/* Month/Year filter */}
        <MonthYearFilter
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
            setPeriod(m, y);
          }}
        />

        {/* Transactions list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionCard transaction={item} onLongPress={() => openEdit(item)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Nenhuma transação neste período.{'\n'}Toque em + para adicionar.
            </ThemedText>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>

      <TransactionModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  balanceCard: {
    backgroundColor: '#208AEF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  balanceLabelText: {
    color: 'rgba(255,255,255,0.8)',
  },
  balanceValue: {
    color: '#fff',
    fontSize: 36,
    lineHeight: 42,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceItem: {
    flex: 1,
    gap: 2,
  },
  balanceDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  balanceAmountText: {
    color: '#fff',
  },
  pieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    gap: 12,
  },
  legend: {
    flex: 1,
    gap: 6,
  },
  legendTitle: {
    marginBottom: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 96,
    paddingTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#208AEF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#208AEF',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '300',
  },
});
