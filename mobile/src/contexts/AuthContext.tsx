import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ENV from '~/utils/constants';

interface AuthContextType {
  authState: {
    token: string | null;
    authenticated: boolean | null;
    user: { email: string } | null;
    offlineMode: boolean;
  };
  register: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  enterOfflineMode: () => void;
  exitOfflineMode: () => void;
  isLoading: boolean;
}
interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
    user: { email: string } | null;
    offlineMode: boolean;
  }>({
    token: null,
    authenticated: null,
    user: null,
    offlineMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios interceptor to handle 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.log('401 error - logging out user');
          await SecureStore.deleteItemAsync('JWT_TOKEN');
          axios.defaults.headers.common['Authorization'] = '';
          setAuthState({ token: null, authenticated: false, user: null, offlineMode: false });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('JWT_TOKEN');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token is still valid by making a test request
          try {
            const response = await axios.get(`${ENV.API_BASE_URL}/users/me`);
            setAuthState({ token, authenticated: true, user: { email: response.data.email }, offlineMode: false });
          } catch (error: any) {
            // Token is invalid or expired
            console.log('Token expired or invalid, logging out');
            await SecureStore.deleteItemAsync('JWT_TOKEN');
            axios.defaults.headers.common['Authorization'] = '';
            setAuthState({ token: null, authenticated: false, user: null, offlineMode: false });
          }
        } else {
          setAuthState({ token: null, authenticated: false, user: null, offlineMode: false });
        }
      } catch (error) {
        console.error('Error loading token:', error);
        setAuthState({ token: null, authenticated: false, user: null, offlineMode: false });
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);
 
  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Registration error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login to:', `${ENV.API_BASE_URL}/auth/login`);
      
      const response = await axios.post(`${ENV.API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      // Get user data after successful login
      const userResponse = await axios.get(`${ENV.API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`
        }
      });

      console.log('User data:', userResponse.data);

      setAuthState({
        token: response.data.access_token,
        authenticated: true,
        user: userResponse.data,
        offlineMode: false,
      });
      
      await SecureStore.setItemAsync('JWT_TOKEN', response.data.access_token);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        method: error?.config?.method
      });
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('JWT_TOKEN');
    axios.defaults.headers.common['Authorization'] = '';
    setAuthState({
      token: null,
      authenticated: false,
      user: null,
      offlineMode: false,
    });
  };

  const enterOfflineMode = () => {
    console.log('Entering offline mode');
    setAuthState({
      token: null,
      authenticated: false,
      user: null,
      offlineMode: true,
    });
  };

  const exitOfflineMode = () => {
    console.log('Exiting offline mode');
    setAuthState({
      token: null,
      authenticated: false,
      user: null,
      offlineMode: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        register: register,
        login: login,
        logout: logout,
        enterOfflineMode,
        exitOfflineMode,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);