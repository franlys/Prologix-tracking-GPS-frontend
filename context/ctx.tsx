import React from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = React.createContext<{
    signIn: (token: string) => void;
    signOut: () => void;
    session?: string | null;
    user?: any | null;
    isLoading: boolean;
}>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    user: null,
    isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
    const value = React.useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }
    return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('token');
    const [user, setUser] = React.useState<any | null>(null);

    // Helper to fetch user profile using the token
    const fetchUserProfile = async (token: string) => {
        try {
            // Note: We could import api here, but to avoid circular dependencies,
            // we'll just skip fetching user for now since we get it from login response
            // Alternatively, a proper implementation would use the api instance
            console.log('Session token set, user profile should be fetched if needed');
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }
    };

    React.useEffect(() => {
        if (session) {
            // If we have a session, try to fetch the user details (e.g. plan, roles)
            // Adjust URL based on environment if needed, using the same logic as api.ts
            // For simplicity here we assume the api service handles the base URL, 
            // but we might need to import the api instance. 
            // Let's rely on the Login component to set User initially or fetch here.
            // For now, let's keep it simple: if session exists, we are "logged in".
            // A robust app would fetch /auth/me here.
            fetchUserProfile(session);
        } else {
            setUser(null);
        }
    }, [session]);

    return (
        <AuthContext.Provider
            value={{
                signIn: (token) => {
                    setSession(token);
                    // Optionally fetch user here
                    fetchUserProfile(token);
                },
                signOut: () => {
                    setSession(null);
                    setUser(null);
                },
                session,
                user,
                isLoading,
            }}>
            {props.children}
        </AuthContext.Provider>
    );
}
