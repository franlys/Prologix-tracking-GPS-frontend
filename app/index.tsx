import { Redirect } from 'expo-router';
import { useSession } from '../context/ctx';

export default function Index() {
  const { session, isLoading } = useSession();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Redirect to tabs if we have a session, otherwise to login
  if (session) {
    return <Redirect href="/(tabs)/map" />;
  }

  return <Redirect href="/(auth)/login" />;
}
