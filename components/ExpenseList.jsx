import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IconButton, List, Snackbar, Text, useTheme } from 'react-native-paper';
import { deleteExpense, getBudgetExpenses } from '../services/budgetService';

const ExpenseList = ({ token, budgetMonthId }) => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBudgetExpenses(token, budgetMonthId);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [token, budgetMonthId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(token, id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setSnackbarMsg('Kiadás törölve');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      setSnackbarMsg('Hiba történt a törlés során');
      setSnackbarVisible(true);
    }
  };

  const renderRightActions = (id) => (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        backgroundColor: theme.colors.error,
      }}
    >
      <IconButton
        icon="delete"
        iconColor="white"
        onPress={() => handleDelete(id)}
      />
    </View>
  );

  if (loading && expenses.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Betöltés...</Text>
      </View>
    );
  }

  if (!loading && expenses.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          Még nincs hozzáadott kiadás ebben a hónapban.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {expenses.map((expense) => (
        <Swipeable
          key={expense.id}
          renderRightActions={() => renderRightActions(expense.id)}
          overshootRight={false}
        >
          <List.Item
            title={expense.description || 'Kiadás'}
            description={`${expense.amount.toLocaleString('hu-HU')} Ft${expense.category ? ` • ${expense.category}` : ''
              }`}
            left={(props) => expense.recurringId ? <List.Icon {...props} icon="refresh" color={theme.colors.primary} /> : <List.Icon {...props} icon="cash" />}
            style={expense.recurringId ? { backgroundColor: theme.colors.secondaryContainer + '20' } : {}}
            right={(props) => (
              <Text
                {...props}
                style={{
                  alignSelf: 'center',
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                {new Date(expense.createdAt || '').toLocaleDateString('hu-HU')}
              </Text>
            )}
          />
        </Swipeable>
      ))}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Text style={{ color: theme.colors.onSurface }}>{snackbarMsg}</Text>
      </Snackbar>
    </View>
  );
};

export default ExpenseList;
