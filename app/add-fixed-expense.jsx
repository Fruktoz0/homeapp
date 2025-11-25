import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import {
    Button,
    HelperText,
    Snackbar,
    Text,
    TextInput,
    useTheme,
    SegmentedButtons,
    Menu,
    Divider
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getToken } from '../services/authService';
import axios from 'axios';
import { API_URL } from '../constants/config';

const AddFixedExpenseScreen = () => {
    const theme = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('MONTHLY');
    const [dueDay, setDueDay] = useState('1');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    const [frequencyMenuVisible, setFrequencyMenuVisible] = useState(false);

    const frequencyLabels = {
        'WEEKLY': 'Hetente',
        'MONTHLY': 'Havonta',
        'BI_MONTHLY': 'Kéthavonta',
        'QUARTERLY': 'Negyedévente',
        'SEMI_ANNUALLY': 'Félévente',
        'YEARLY': 'Évente'
    };

    const handleSave = async () => {
        if (!name || !amount || !dueDay) {
            setSnackbarMsg('Kérlek tölts ki minden kötelező mezőt!');
            setSnackbarVisible(true);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();

            await axios.post(`${API_URL}/budget/recurring`, {
                name,
                amount: parseFloat(amount),
                frequency,
                due_day: parseInt(dueDay),
                category,
                auto_apply: true // Default to auto-apply for now
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbarMsg('Fix költség sikeresen létrehozva!');
            setSnackbarVisible(true);
            setTimeout(() => router.back(), 1200);
        } catch (err) {
            console.error(err);
            setSnackbarMsg('Hiba történt a mentés során.');
            setSnackbarVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                    Új fix költség
                </Text>

                <TextInput
                    label="Megnevezés"
                    mode="outlined"
                    value={name}
                    onChangeText={setName}
                    style={{ marginBottom: 12 }}
                />

                <TextInput
                    label="Összeg (Ft)"
                    mode="outlined"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={{ marginBottom: 12 }}
                />

                <TextInput
                    label="Kategória"
                    mode="outlined"
                    value={category}
                    onChangeText={setCategory}
                    style={{ marginBottom: 12 }}
                />

                <View style={{ marginBottom: 12 }}>
                    <Text variant="bodyMedium" style={{ marginBottom: 5, color: theme.colors.onSurfaceVariant }}>Gyakoriság</Text>
                    <Menu
                        visible={frequencyMenuVisible}
                        onDismiss={() => setFrequencyMenuVisible(false)}
                        anchor={
                            <Button mode="outlined" onPress={() => setFrequencyMenuVisible(true)}>
                                {frequencyLabels[frequency]}
                            </Button>
                        }
                    >
                        {Object.entries(frequencyLabels).map(([key, label]) => (
                            <Menu.Item key={key} onPress={() => { setFrequency(key); setFrequencyMenuVisible(false); }} title={label} />
                        ))}
                    </Menu>
                </View>

                <TextInput
                    label="Esedékes nap (hónapon belül)"
                    mode="outlined"
                    value={dueDay}
                    onChangeText={setDueDay}
                    keyboardType="numeric"
                    maxLength={2}
                    style={{ marginBottom: 20 }}
                />

                <Button mode="contained" onPress={handleSave} loading={loading}>
                    Mentés
                </Button>
            </ScrollView>

            <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={2000}>
                {snackbarMsg}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

export default AddFixedExpenseScreen;
