import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../context/ctx';
import { Redirect } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Theme';

export default function TabLayout() {
    const { session, isLoading } = useSession();
    const insets = useSafeAreaInsets();

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
                tabBarActiveTintColor: Colors.primary['500'],
                tabBarInactiveTintColor: Colors.light.textSecondary,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: Colors.light.border,
                    borderTopWidth: 1,
                    paddingTop: 4,
                    paddingBottom: Platform.OS === 'android' ? insets.bottom + 4 : 4,
                    height: Platform.OS === 'android' ? 60 + insets.bottom : 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Mapa',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "map" : "map-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="devices"
                options={{
                    title: 'Dispositivos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "car" : "car-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="subscription"
                options={{
                    title: 'Planes',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "diamond" : "diamond-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
