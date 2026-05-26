import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Transaction } from '@/context/FinanceContext';

type Props = {
  transaction: Transaction;
  onLongPress: () => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function TransactionCard({ transaction, onLongPress }: Props) {
  const theme = useTheme();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? '#2ECC71' : '#E74C3C';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={[styles.categoryDot, { backgroundColor: transaction.categoryBackground }]} />
      <View style={styles.info}>
        <ThemedText type="default">{transaction.description}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {transaction.category} · {formatDate(transaction.date)}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={{ color: amountColor }}>
        {isIncome ? '+' : '-'} {formatCurrency(transaction.value)}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
