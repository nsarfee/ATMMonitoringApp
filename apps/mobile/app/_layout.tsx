import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const BOP_ORANGE = '#f26522';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="atm/[id]"
          options={{
            headerShown: true,
            title: 'ATM Detail',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: BOP_ORANGE,
            headerTitleStyle: { color: '#1d1d1f', fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
