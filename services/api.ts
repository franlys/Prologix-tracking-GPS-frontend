import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Storage abstraction for web vs native
const storage = {
    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    async deleteItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    },
};

// Read from environment variable (app.config.js)
// Falls back to localhost for development
const getBaseUrl = () => {
  // First check process.env (Expo's EXPO_PUBLIC_* variables)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl && envUrl !== 'http://localhost:3000') {
    // Production/Railway URL from environment
    console.log('✅ Using EXPO_PUBLIC_API_URL from environment:', envUrl);
    return envUrl;
  }

  // Fallback to Constants.expoConfig.extra
  const configUrl = Constants.expoConfig?.extra?.apiUrl;
  if (configUrl && configUrl !== 'http://localhost:3000') {
    console.log('✅ Using apiUrl from config:', configUrl);
    return configUrl;
  }

  // Development: Extract IP from Expo's hostUri for physical devices
  const { hostUri } = Constants.expoConfig || {};

  if (hostUri) {
    // hostUri looks like: "192.168.1.100:8081"
    // We extract the IP and use port 3000 for backend
    const host = hostUri.split(':')[0];
    console.log('📱 Using local network IP for development:', `http://${host}:3000`);
    return `http://${host}:3000`;
  }

  // Fallback: Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
  const fallbackUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  console.log('⚠️ Using fallback URL:', fallbackUrl);
  return fallbackUrl;
};

const BASE_URL = getBaseUrl();

console.log('📡 API Base URL:', BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await storage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const token = await storage.getItem('token');
                if (token) {
                    const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const { accessToken } = response.data;
                    await storage.setItem('token', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                await storage.deleteItem('token');
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
