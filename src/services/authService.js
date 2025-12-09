import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth`;

class AuthService {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        this.activityTimer = null;
        this.authStateListeners = [];

        // Load tokens from localStorage on initialization
        this.loadFromStorage();
    }

    // Load authentication data from localStorage
    loadFromStorage() {
        try {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
            const userStr = localStorage.getItem('user');
            this.user = userStr ? JSON.parse(userStr) : null;
        } catch (err) {
            console.error('Error loading auth data from storage:', err);
            this.clearStorage();
        }
    }

    // Save authentication data to localStorage
    saveToStorage(accessToken, refreshToken, user) {
        try {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Keep legacy storage for backward compatibility (will be removed later)
            localStorage.setItem('adminId', user.id);
            localStorage.setItem('adminName', user.name);
            localStorage.setItem('userEmail', user.email);

            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.user = user;

            this.notifyAuthStateChange(true);
        } catch (err) {
            console.error('Error saving auth data to storage:', err);
        }
    }

    // Clear all authentication data
    clearStorage() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Clear legacy storage
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('authToken');

        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;

        this.notifyAuthStateChange(false);
    }

    // Register auth state listener
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners of auth state change
    notifyAuthStateChange(isAuthenticated) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(isAuthenticated, this.user);
            } catch (err) {
                console.error('Error in auth state listener:', err);
            }
        });
    }

    // Login user
    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });

            if (response.data.success) {
                this.saveToStorage(
                    response.data.token,
                    response.data.refreshToken,
                    response.data.user
                );
                this.startActivityTracking();
                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.data.error };
        } catch (err) {
            console.error('Login error:', err);
            return {
                success: false,
                error: err.response?.data?.error || 'Login failed. Please try again.'
            };
        }
    }

    // Register user
    async register(name, email, password, role = 'admin') {
        try {
            console.log('=== REGISTER ATTEMPT ===');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Password length:', password?.length);
            console.log('Role:', role);
            console.log('API URL:', API_URL);

            const payload = { name, email, password, role };
            console.log('Request payload:', payload);

            const response = await axios.post(`${API_URL}/register`, payload);

            console.log('Response received:', response);
            console.log('Response data:', response.data);

            if (response.data.success) {
                this.saveToStorage(
                    response.data.token,
                    response.data.refreshToken,
                    response.data.user
                );
                this.startActivityTracking();
                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.data.error };
        } catch (err) {
            console.error('=== REGISTRATION ERROR ===');
            console.error('Error object:', err);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);
            console.error('Error response status:', err.response?.status);
            console.error('Error message:', err.message);
            return {
                success: false,
                error: err.response?.data?.error || 'Registration failed. Please try again.'
            };
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.accessToken) {
                await axios.post(`${API_URL}/logout`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                });
            }
        } catch (err) {
            console.error('Logout error:', err);
            // Continue with logout even if API call fails
        } finally {
            this.clearStorage();
            this.stopActivityTracking();
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        // Prevent multiple simultaneous refresh requests
        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push((token) => {
                    resolve(token);
                });
            });
        }

        this.isRefreshing = true;

        try {
            const response = await axios.post(`${API_URL}/refresh`, {
                refreshToken: this.refreshToken
            });

            if (response.data.success) {
                this.saveToStorage(
                    response.data.token,
                    response.data.refreshToken,
                    this.user
                );

                // Notify all subscribers
                this.refreshSubscribers.forEach(callback => callback(response.data.token));
                this.refreshSubscribers = [];

                this.isRefreshing = false;
                return response.data.token;
            }

            throw new Error('Token refresh failed');
        } catch (err) {
            console.error('Token refresh error:', err);
            this.isRefreshing = false;
            this.clearStorage();
            window.location.href = '/login';
            return null;
        }
    }

    // Get valid access token (refreshes if needed)
    async getAccessToken() {
        if (!this.accessToken || !this.refreshToken) {
            return null;
        }

        // Check if token is about to expire (within 1 minute)
        try {
            const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
            const expiresAt = payload.exp * 1000;
            const now = Date.now();

            // If token expires in less than 1 minute, refresh it
            if (expiresAt - now < 60000) {
                return await this.refreshAccessToken();
            }

            return this.accessToken;
        } catch (err) {
            console.error('Error parsing token:', err);
            return this.accessToken;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!(this.accessToken && this.refreshToken && this.user);
    }

    // Get current user
    getUser() {
        return this.user;
    }

    // Start tracking user activity for idle timeout
    startActivityTracking() {
        const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        let idleTime = 0;

        // Clear existing timer
        this.stopActivityTracking();

        const resetTimer = () => {
            idleTime = 0;
        };

        const checkIdle = () => {
            idleTime += 1000;
            if (idleTime >= IDLE_TIMEOUT) {
                console.log('Session timeout due to inactivity');
                this.logout();
                window.location.href = '/login?reason=timeout';
            }
        };

        // Track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Check idle time every second
        this.activityTimer = setInterval(checkIdle, 1000);
    }

    // Stop activity tracking
    stopActivityTracking() {
        if (this.activityTimer) {
            clearInterval(this.activityTimer);
            this.activityTimer = null;
        }
    }

    // Verify token with backend
    async verifyToken() {
        try {
            const token = await this.getAccessToken();
            if (!token) return false;

            const response = await axios.get(`${API_URL}/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data.success && response.data.valid;
        } catch (err) {
            console.error('Token verification error:', err);
            return false;
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
