import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
    Button,
    HelperText,
    Snackbar,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { createExpense } from '../../services/budgetService';
import type { BudgetExpense } from '../../types/budget';

const AddExpenseScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  // 🔹 Ezeket majd később a user & month contextből húzzuk
  const token = 'TOKEN_IDE';
  const budgetMonthId = 1;

  // 🔹 Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState<'HUF' | 'EUR' | 'USD'>('HUF');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const handleSave = async () => {
    if (!amount) {
      setSnackbarMsg('Kérlek, add meg az összeget.');
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);

      const newExpense: Omit<BudgetExpense, 'id'> = {
        budgetMonthId,
        userId: 'USER_IDE', // majd a JWT-ből jön
        description: description || 'Kiadás',
        amount: parseFloat(amount),
        category,
        currency,
      };

      await createExpense(token, newExpense);

      setSnackbarMsg('Kiadás sikeresen rögzítve!');
      setSnackbarVisible(true);

      // kis várakozás a visszalépés előtt
      setTimeout(() => router.back(), 1200);
    } catch (err) {
      console.error(err);
      setSnackbarMsg('Hiba történt mentés közben');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const hasAmountError = amount !== '' && isNaN(Number(amount));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          variant="headlineSmall"
          style={{
            color: theme.colors.primary,
            fontWeight: 'bold',
            marginBottom: 12,
          }}
        >
          Új kiadás hozzáadása
        </Text>

        {/* Összeg */}
        <TextInput
          label="Összeg"
          mode="outlined"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          error={hasAmountError}
          style={{ marginBottom: 4 }}
        />
        {hasAmountError && (
          <HelperText type="error">Csak számokat adhatsz meg.</HelperText>
        )}

        {/* Leírás */}
        <TextInput
          label="Leírás"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          placeholder="pl.: bolt, benzin, BudapestGO"
          style={{ marginTop: 12 }}
        />

        {/* Kategória */}
        <TextInput
          label="Kategória"
          mode="outlined"
          value={category}
          onChangeText={setCategory}
          placeholder="pl.: közlekedés, étel, rezsi"
          style={{ marginTop: 12 }}
        />

        {/* Pénznem */}
        <TextInput
          label="Pénznem"
          mode="outlined"
          value={currency}
          onChangeText={(text) =>
            setCurrency(text.toUpperCase() as 'HUF' | 'EUR' | 'USD')
          }
          maxLength={3}
          style={{ marginTop: 12 }}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          style={{
            marginTop: 24,
            borderRadius: 8,
            backgroundColor: theme.colors.primary,
          }}
        >
          Mentés
        </Button>

        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          Dátum: {format(new Date(), 'yyyy. MMMM dd.', { locale: hu })}
        </Text>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{
          backgroundColor: theme.colors.surface,
          marginBottom: 20,
          marginHorizontal: 12,
        }}
      >
        <Text style={{ color: theme.colors.onSurface }}>{snackbarMsg}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

export default AddExpenseScreen;
