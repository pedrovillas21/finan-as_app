import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Transaction, TransactionType, useFinance } from '@/context/FinanceContext';

type Props = {
  visible: boolean;
  transaction?: Transaction | null;
  onClose: () => void;
};

export function TransactionModal({ visible, transaction, onClose }: Props) {
  const theme = useTheme();
  const { categories, addTransaction, editTransaction, deleteTransaction, addCategory } =
    useFinance();

  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredCategories = categories.filter(
    (c) => c.isIncome === (type === 'income')
  );
  const selectedCategory = categories.find((c) => c.displayName === category);

  useEffect(() => {
    if (visible) {
      setShowCategoryPicker(false);
      setShowNewCategory(false);
      setNewCategoryName('');
      if (transaction) {
        setDescription(transaction.description);
        setValue(transaction.value.toString());
        setType(transaction.type);
        setCategory(transaction.category);
      } else {
        setDescription('');
        setValue('');
        setType('expense');
        const firstExpense = categories.find((c) => !c.isIncome);
        setCategory(firstExpense?.displayName ?? '');
      }
    }
  }, [visible, transaction]);

  // Ao trocar o toggle Despesa/Receita, garante que a categoria selecionada
  // pertence ao tipo atual; senão, escolhe a primeira do tipo novo.
  useEffect(() => {
    if (!visible) return;
    const stillValid = filteredCategories.some((c) => c.displayName === category);
    if (!stillValid) {
      setCategory(filteredCategories[0]?.displayName ?? '');
    }
  }, [type, visible]);

  async function handleSave() {
    const parsedValue = parseFloat(value.replace(',', '.'));
    if (!description.trim() || isNaN(parsedValue) || parsedValue <= 0 || !category) {
      Alert.alert('Atenção', 'Preencha todos os campos corretamente.');
      return;
    }
    const data = {
      description: description.trim(),
      value: parsedValue,
      type,
      category,
      date: transaction?.date ?? new Date().toISOString(),
    };
    if (transaction) {
      await editTransaction(transaction.id, data);
    } else {
      await addTransaction(data);
    }
    onClose();
  }

  function handleDelete() {
    Alert.alert('Excluir transação', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction!.id);
          onClose();
        },
      },
    ]);
  }

  async function handleAddCategory() {
    if (newCategoryName.trim()) {
      await addCategory(newCategoryName.trim(), type === 'income');
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategory(false);
      setShowCategoryPicker(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.backgroundSelected },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.sheet}>
          <View style={styles.header}>
            <ThemedText type="subtitle">
              {transaction ? 'Editar' : 'Nova Transação'}
            </ThemedText>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <ThemedText themeColor="textSecondary" style={styles.closeBtn}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Type toggle */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
                onPress={() => setType('expense')}
              >
                <ThemedText type="smallBold" style={type === 'expense' ? styles.typeBtnActiveText : undefined}>
                  Despesa
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
                onPress={() => setType('income')}
              >
                <ThemedText type="smallBold" style={type === 'income' ? styles.typeBtnActiveText : undefined}>
                  Receita
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Descrição
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Supermercado"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Valor (R$)
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={value}
              onChangeText={setValue}
              placeholder="0,00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
            />

            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Categoria
            </ThemedText>
            <TouchableOpacity
              style={[styles.input, styles.categoryTrigger, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              {selectedCategory && (
                <View style={[styles.catDot, { backgroundColor: selectedCategory.background }]} />
              )}
              <ThemedText type="default">{category || 'Selecionar...'}</ThemedText>
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={[styles.categoryList, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                {filteredCategories.length === 0 && !showNewCategory && (
                  <View style={styles.categoryItem}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Nenhuma categoria de {type === 'income' ? 'receita' : 'despesa'} ainda.
                    </ThemedText>
                  </View>
                )}
                {filteredCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      styles.categoryItemRow,
                      cat.displayName === category && { backgroundColor: theme.backgroundSelected },
                    ]}
                    onPress={() => {
                      setCategory(cat.displayName);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={[styles.catDot, { backgroundColor: cat.background }]} />
                    <ThemedText type="default">{cat.displayName}</ThemedText>
                  </TouchableOpacity>
                ))}
                {!showNewCategory ? (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => setShowNewCategory(true)}
                  >
                    <ThemedText type="smallBold" style={styles.addCatText}>
                      + Nova Categoria
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.newCatRow}>
                    <TextInput
                      style={[
                        styles.newCatInput,
                        { backgroundColor: theme.backgroundSelected, color: theme.text },
                      ]}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      placeholder="Nome da categoria"
                      placeholderTextColor={theme.textSecondary}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleAddCategory} style={styles.newCatBtn}>
                      <ThemedText type="smallBold" style={styles.addCatText}>OK</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <ThemedText type="smallBold" style={styles.saveBtnText}>
                {transaction ? 'Salvar Alterações' : 'Adicionar'}
              </ThemedText>
            </TouchableOpacity>

            {transaction && (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <ThemedText type="smallBold" style={styles.deleteBtnText}>
                  Excluir Transação
                </ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    fontSize: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  typeBtnExpense: {
    backgroundColor: '#E74C3C',
  },
  typeBtnIncome: {
    backgroundColor: '#2ECC71',
  },
  typeBtnActiveText: {
    color: '#fff',
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
    justifyContent: 'center',
  },
  categoryList: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  categoryItem: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  categoryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addCatText: {
    color: '#208AEF',
  },
  newCatRow: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    alignItems: 'center',
  },
  newCatInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  newCatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveBtn: {
    backgroundColor: '#208AEF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnText: {
    color: '#E74C3C',
    fontSize: 16,
  },
  bottomSpacer: {
    height: 16,
  },
});
