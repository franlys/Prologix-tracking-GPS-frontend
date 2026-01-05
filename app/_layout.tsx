import { Slot } from 'expo-router';
import { SessionProvider } from '../context/ctx';
import { Platform } from 'react-native';

// Note: Leaflet CSS is loaded only on web platform via next.config or webpack config
// We don't import it here to avoid Metro bundler errors on mobile

export default function Root() {
    // Set up the auth context and render our layout inside of it.
    return (
        <SessionProvider>
            <Slot />
        </SessionProvider>
    );
}
