import React from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = React.createContext<{
    signIn: (token: string, userInfo?: any) => void;
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
    const [[userLoading, userData], setUserData] = useStorageState('user');
    const [user, setUser] = React.useState<any | null>(null);

    React.useEffect(() => {
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Failed to parse user data', e);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [userData]);

    return (
        <AuthContext.Provider
            value={{
                signIn: (token, userInfo = null) => {
                    setSession(token);
                    if (userInfo) {
                        setUserData(JSON.stringify(userInfo));
                        setUser(userInfo);
                    }
                },
                signOut: () => {
                    setSession(null);
                    setUserData(null);
                    setUser(null);
                },
                session,
                user,
                isLoading: isLoading || userLoading,
            }}>
            {props.children}
        </AuthContext.Provider>
    );
}
