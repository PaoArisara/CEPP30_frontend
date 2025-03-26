// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { LoginCredentials, User } from '../types/UserType';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../services/AuthenService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: (redirect?: boolean) => void;
    refreshAccessToken: () => Promise<boolean>; // Add this line
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constants for token refresh behavior
const REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const TOKEN_EXPIRY_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiration

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const refreshInProgressRef = useRef<boolean>(false);

    const checkTokenExpiration = useCallback((token: string): boolean => {
        try {
            const decoded: any = jwtDecode(token);
            const expirationTime = decoded.exp * 1000; // Convert to milliseconds
            const isExpiring = Date.now() >= (expirationTime - TOKEN_EXPIRY_THRESHOLD);

            if (isExpiring) {
                console.log('Token is expiring soon, needs refresh');
            }

            return isExpiring;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    }, []);

    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        // Prevent multiple simultaneous refresh attempts
        if (refreshInProgressRef.current) {
            console.log('Token refresh already in progress, skipping');
            return false;
        }

        refreshInProgressRef.current = true;

        try {
            console.log('Starting token refresh process');
            const refreshToken = AuthService.getRefreshToken();

            if (!refreshToken) {
                console.error('No refresh token found');
                return false;
            }

            console.log('Calling refresh token API...');
            const refreshData = await AuthService.refreshToken(refreshToken);

            if (!refreshData || !refreshData.accessToken || !refreshData.refreshToken) {
                console.error('Invalid refresh response');
                return false;
            }

            console.log('Refresh successful, updating tokens');
            AuthService.setTokens(refreshData.accessToken, refreshData.refreshToken);
            setToken(refreshData.accessToken);

            const currentUser = AuthService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        } finally {
            refreshInProgressRef.current = false;
        }
    }, []);

    const handleLogout = useCallback((redirect: boolean = false) => {
        try {
            console.log('Logging out...');
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            AuthService.logout();
            setUser(null);
            setToken(null);

            if (redirect) {
                console.log('Redirecting to login page...');
                window.location.href = '/login'; // Direct redirection
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const startRefreshTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        console.log('Starting token refresh timer');

        const timer = setInterval(async () => {
            const accessToken = AuthService.getAccessToken();
            if (accessToken && checkTokenExpiration(accessToken)) {
                console.log('Token refresh timer triggered');
                await refreshAccessToken();
            }
        }, REFRESH_INTERVAL);

        timerRef.current = timer;

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [checkTokenExpiration, refreshAccessToken]);

    // Initial auth check on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('Checking authentication status...');
                const accessToken = AuthService.getAccessToken();

                if (!accessToken) {
                    console.log('No access token found');
                    setIsLoading(false);
                    return;
                }

                if (checkTokenExpiration(accessToken)) {
                    console.log('Token is expired or expiring soon, attempting refresh');
                    const refreshSuccess = await refreshAccessToken();
                    if (!refreshSuccess) {
                        return;
                    }
                }

                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) {
                    console.log('No user data found despite having token');
                    throw new Error('Invalid user data');
                }

                console.log('User authenticated:', currentUser.username);
                setUser(currentUser);
                setToken(accessToken);

                // Start the refresh timer
                const cleanup = startRefreshTimer();

                return cleanup;
            } catch (error) {
                console.error('Auth check failed:', error);
                handleLogout(true);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Clean up the timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [checkTokenExpiration, refreshAccessToken, startRefreshTimer, handleLogout]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            console.log('Login attempt started...');
            const loggedInUser = await AuthService.login(credentials);

            if (!loggedInUser) {
                throw new Error('Login response missing user data');
            }

            console.log('Login successful:', loggedInUser.username);

            // Update both user and token
            setUser(loggedInUser);
            const accessToken = AuthService.getAccessToken();
            setToken(accessToken);

            // Start the token refresh timer
            startRefreshTimer();
        } catch (error) {
            console.error('Login attempt failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [startRefreshTimer]);

    const contextValue = {
        isAuthenticated: !!user && !!token,
        isLoading,
        user,
        token,
        login,
        logout: handleLogout,
        refreshAccessToken
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};