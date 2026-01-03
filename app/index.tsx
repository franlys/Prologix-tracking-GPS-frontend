import { Redirect } from 'expo-router';
import { useSession } from '../context/ctx';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { session, user, isLoading } = useSession();

  // Show loading while checking session
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // No session - go to login
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Has session - redirect based on role
  if (user) {
    console.log('User role detected:', user.role);

    if (user.role === 'ADMIN') {
      return <Redirect href="/(admin)/dashboard" />;
    } else if (user.role === 'INSTALLER') {
      return <Redirect href="/(installer)/dashboard" />;
    } else {
      // USER role
      return <Redirect href="/(tabs)/dashboard" />;
    }
  }

  // Fallback to login if user data is not available yet
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7c3aed" />
      <Text style={styles.loadingText}>Validando usuario...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});
