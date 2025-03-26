// src/services/AuthService.ts
import axios from 'axios';
import { API_CONFIG } from '../config/ApiConfig';
import { AuthError, AuthErrorType, AuthResponse, LoginCredentials, User } from '../types/UserType';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_OPTIONS = {
    // secure: true,  // Enable in production with HTTPS
    sameSite: 'strict' as const,
    expires: 30  // Increased to 30 days for longer sessions
};

// Create an axios instance for authentication-related requests
const authAxios = axios.create({
    baseURL: API_CONFIG.baseURL
});

// Add response interceptor to handle token refresh
authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 (Unauthorized) and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                const refreshToken = AuthService.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                const refreshResponse = await axios.post(
                    `${API_CONFIG.baseURL}/auth/refresh`,
                    { refreshToken }
                );
                
                if (refreshResponse.data.statusCode === 200) {
                    const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
                    
                    // Update tokens
                    AuthService.setTokens(accessToken, newRefreshToken);
                    
                    // Update the Authorization header
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    
                    // Retry the original request
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed during interceptor:', refreshError);
                // Force logout on refresh failure
                AuthService.logout();
                // Redirect to login page
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export const AuthService = {
    async login(credentials: LoginCredentials): Promise<User> {
        try {
            // Clear any existing tokens first
            this.logout();
            delete axios.defaults.headers.common['Authorization'];

            console.log('Attempting login with credentials:', 
                { username: credentials.username, password: '******' });

            const response = await authAxios.post<AuthResponse>(
                '/auth/login',
                credentials
            );

            if (response.data.statusCode === 200) {
                const { user, accessToken, refreshToken } = response.data.data;
                
                console.log('Login successful, setting tokens and user data');
                
                this.setTokens(accessToken, refreshToken);
                this.setUserData(user);
                
                // Set authorization header for all future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                return user;
            }

            throw {
                type: AuthErrorType.UNKNOWN_ERROR,
                message: 'Login failed'
            } as AuthError;
        } catch (error) {
            console.error('Login error:', error);
            
            if (axios.isAxiosError(error)) {
                if (!error.response) {
                    throw {
                        type: AuthErrorType.NETWORK_ERROR,
                        message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
                    } as AuthError;
                }

                if (error.response.status === 401) {
                    throw {
                        type: AuthErrorType.INVALID_CREDENTIALS,
                        message: error.response.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
                    } as AuthError;
                }

                throw {
                    type: AuthErrorType.UNKNOWN_ERROR,
                    message: error.response.data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
                } as AuthError;
            }

            throw {
                type: AuthErrorType.UNKNOWN_ERROR,
                message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
            } as AuthError;
        }
    },

    async refreshToken(refreshToken: string) {
        try {
            console.log('Attempting to refresh token');
            
            const response = await authAxios.post('/auth/refresh', {
                refreshToken
            });

            if (response.data.statusCode === 200) {
                const tokens = response.data.data;
                
                console.log('Token refresh successful');
                
                return tokens;
            }
            
            throw new Error('Refresh token failed');
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    },

    async logout(redirect = false) {
        try {
            const accessToken = this.getAccessToken();
            
            if (accessToken) {
                // Try to notify server about logout
                await axios.post(
                    `${API_CONFIG.baseURL}/auth/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                ).catch(error => {
                    console.warn('Logout API error (non-critical):', error);
                });
            }
        } catch (error) {
            console.warn('Error during logout API call:', error);
        } finally {
            // Always clear cookies and headers regardless of API success
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('user');
            delete axios.defaults.headers.common['Authorization'];
            
            if (redirect) {
                window.location.href = '/login';
            }
        }
    },

    setTokens(accessToken: string, refreshToken: string) {
        Cookies.set('accessToken', accessToken, TOKEN_COOKIE_OPTIONS);
        Cookies.set('refreshToken', refreshToken, TOKEN_COOKIE_OPTIONS);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Log token setting (partial tokens for security)
        console.log('Tokens set successfully', {
            accessToken: `${accessToken.substring(0, 10)}...`,
            refreshToken: `${refreshToken.substring(0, 10)}...`
        });
    },

    setUserData(user: User) {
        Cookies.set('user', JSON.stringify(user), TOKEN_COOKIE_OPTIONS);
    },

    getCurrentUser(): User | null {
        const userStr = Cookies.get('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getAccessToken(): string | null {
        return Cookies.get('accessToken') || null;
    },

    getRefreshToken(): string | null {
        return Cookies.get('refreshToken') || null;
    },

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },
    
    // Helper to check token expiration
    isTokenExpired(token: string): boolean {
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            
            // Add a 5-minute buffer
            return Date.now() >= (expiryTime - 5 * 60 * 1000);
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }
};

export default AuthService;