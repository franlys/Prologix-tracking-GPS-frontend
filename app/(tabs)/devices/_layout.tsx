import { Stack } from 'expo-router';

export default function DevicesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'Devices' }} />
            <Stack.Screen name="[id]" options={{ title: 'Device Map', headerShown: true }} />
        </Stack>
    );
}
