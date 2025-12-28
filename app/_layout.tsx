import { Slot } from 'expo-router';
import { SessionProvider } from '../context/ctx';
import { Platform } from 'react-native';

// Import Leaflet CSS for web
if (Platform.OS === 'web') {
    require('leaflet/dist/leaflet.css');
}

export default function Root() {
    // Set up the auth context and render our layout inside of it.
    return (
        <SessionProvider>
            <Slot />
        </SessionProvider>
    );
}
