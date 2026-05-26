import { ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useFinance } from '@/context/FinanceContext';
import { MonthYearFilter } from '@/components/MonthYearFilter';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ResumoScreen() {
  const { transactions } = useFinance();
  const theme = useTheme();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.value, 0);
  const expense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);
  const balance = income - expense;

  const expensesByCategory = filtered
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, { amount: number; background: string }>>((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { amount: 0, background: t.categoryBackground };
      }
      acc[t.category].amount += t.value;
      return acc;
    }, {});

  const categoryEntries = Object.entries(expensesByCategory).sort(
    (a, b) => b[1].amount - a[1].amount
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>
          Resumo
        </ThemedText>

        <MonthYearFilter
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardIncome]}>
              <ThemedText type="small" themeColor="textSecondary">
                Receitas
              </ThemedText>
              <ThemedText type="smallBold" style={styles.incomeText}>
                {formatCurrency(income)}
              </ThemedText>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardExpense]}>
              <ThemedText type="small" themeColor="textSecondary">
                Despesas
              </ThemedText>
              <ThemedText type="smallBold" style={styles.expenseText}>
                {formatCurrency(expense)}
              </ThemedText>
            </View>
          </View>

          {/* Balance summary */}
          <View style={[styles.balanceSummary, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">
              Saldo do período
            </ThemedText>
            <ThemedText
              type="smallBold"
              style={{ color: balance >= 0 ? '#2ECC71' : '#E74C3C' }}
            >
              {formatCurrency(balance)}
            </ThemedText>
          </View>

          {/* Expenses by category */}
          {categoryEntries.length > 0 ? (
            <>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Despesas por categoria
              </ThemedText>

              {/* Stacked bar (visual pie) */}
              {expense > 0 && (
                <View style={styles.stackedBar}>
                  {categoryEntries.map(([cat, { amount, background }]) => (
                    <View
                      key={cat}
                      style={[
                        styles.stackedSegment,
                        {
                          flex: amount / expense,
                          backgroundColor: background,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Category rows */}
              {categoryEntries.map(([cat, { amount, background }]) => {
                const pct = expense > 0 ? Math.round((amount / expense) * 100) : 0;
                return (
                  <View
                    key={cat}
                    style={[styles.catCard, { backgroundColor: theme.backgroundElement }]}
                  >
                    <View style={styles.catHeader}>
                      <View style={[styles.catDot, { backgroundColor: background }]} />
                      <ThemedText type="default" style={styles.catName}>
                        {cat}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {pct}%
                      </ThemedText>
                      <ThemedText type="smallBold">{formatCurrency(amount)}</ThemedText>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct}%`, backgroundColor: background },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Nenhuma despesa neste período.
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  title: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  scroll: {
    paddingBottom: 40,
    paddingTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    gap: 6,
  },
  summaryCardIncome: {
    backgroundColor: '#2ECC7118',
  },
  summaryCardExpense: {
    backgroundColor: '#E74C3C18',
  },
  incomeText: {
    color: '#2ECC71',
  },
  expenseText: {
    color: '#E74C3C',
  },
  balanceSummary: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  stackedSegment: {
    height: '100%',
  },
  catCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  catName: {
    flex: 1,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(128,128,128,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
  },
});
