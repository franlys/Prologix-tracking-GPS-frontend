import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../context/ctx';
import { Redirect } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
            }}>
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="devices"
                options={{
                    title: 'Devices',
                    tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
