import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import {
  Button,
  HelperText,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useBudget } from '../contexts/BudgetContext';
import { getToken } from '../services/authService';
import { createExpense, getBudgetMonths } from '../services/budgetService';
import { getUserFromToken } from '../utils/token';

const AddExpenseScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { month } = useLocalSearchParams();
  const { budgetMonthId, setBudgetMonthId } = useBudget();

  // 🔹 Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('HUF');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // Ha nincs budgetMonthId (pl. reload után), próbáljuk meg lekérni
  useEffect(() => {
    const checkBudgetMonthId = async () => {
      // Ha kaptunk month paramétert, azt használjuk, egyébként az aktuális hónapot
      const targetMonthIndex = month !== undefined ? parseInt(month) : new Date().getMonth();

      try {
        const token = await getToken();
        if (token) {
          const budgetData = await getBudgetMonths(token, targetMonthIndex);
          if (budgetData?.currentMonth?.id) {
            setBudgetMonthId(budgetData.currentMonth.id);
          }
        }
      } catch (error) {
        console.error('Failed to recover budgetMonthId:', error);
      }
    };

    checkBudgetMonthId();
  }, [budgetMonthId, month]);

  const handleSave = async () => {
    if (!amount) {
      setSnackbarMsg('Kérlek, add meg az összeget.');
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) throw new Error('Hiányzó token');

      const user = getUserFromToken(token);
      if (!user) throw new Error('Hiányzó felhasználó');

      // Ha még mindig nincs ID, akkor dobunk hibát
      if (!budgetMonthId) throw new Error('Hiányzó hónap azonosító');

      const newExpense = {
        budgetMonthId,
        userId: user.id,
        description: description || 'Kiadás',
        amount: parseFloat(amount),
        category,
        currency,
      };

      await createExpense(token, newExpense);

      setSnackbarMsg('Kiadás sikeresen rögzítve!');
      setSnackbarVisible(true);

      setTimeout(() => router.back(), 1200);
    } catch (err) {
      console.error(err);
      setSnackbarMsg('Hiba történt mentés közben: ' + (err.message || 'Ismeretlen hiba'));
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

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Minden tartalmi elem (fejléc, űrlap, gomb) egy konténerben van, ami középre kerül */}
        <View>
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.primary,
              fontWeight: 'bold',
              marginBottom: 24, // Növeltük a margót a középre kerülés miatt
              textAlign: 'center', // Középre igazítja a szöveget
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
              setCurrency(text.toUpperCase())
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
        </View>
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