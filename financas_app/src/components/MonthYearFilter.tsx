import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type Props = {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
};

export function MonthYearFilter({ month, year, onChange }: Props) {
  const theme = useTheme();

  function prev() {
    if (month === 0) onChange(11, year - 1);
    else onChange(month - 1, year);
  }

  function next() {
    if (month === 11) onChange(0, year + 1);
    else onChange(month + 1, year);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <TouchableOpacity onPress={prev} style={styles.arrow} hitSlop={8}>
        <ThemedText style={styles.arrowText}>‹</ThemedText>
      </TouchableOpacity>
      <ThemedText type="smallBold">
        {MONTHS[month]} {year}
      </ThemedText>
      <TouchableOpacity onPress={next} style={styles.arrow} hitSlop={8}>
        <ThemedText style={styles.arrowText}>›</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  arrow: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 22,
    lineHeight: 26,
  },
});
