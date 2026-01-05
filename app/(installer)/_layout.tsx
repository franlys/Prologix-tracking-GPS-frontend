import { Stack } from 'expo-router';
import { useSession } from '../../context/ctx';
import { Redirect } from 'expo-router';
import { Text } from 'react-native';

export default function InstallerLayout() {
    const { session, user, isLoading } = useSession();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }

    // Only installers can access this section
    if (user?.role !== 'INSTALLER') {
        console.log('Non-installer trying to access installer section, redirecting...');
        return <Redirect href="/(tabs)/dashboard" />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen
                name="dashboard"
                options={{
                    title: 'Panel de Instalador',
                }}
            />
            <Stack.Screen
                name="clients"
                options={{
                    title: 'Mis Clientes',
                }}
            />
            <Stack.Screen
                name="commissions"
                options={{
                    title: 'Comisiones',
                }}
            />
        </Stack>
    );
}
