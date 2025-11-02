import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { appTheme } from '../constants/theme';



export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={appTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: appTheme.colors.background },
          }}
        />
      </PaperProvider>
    </GestureHandlerRootView>

  );
}
