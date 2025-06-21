import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ENV from '~/utils/constants';

interface AuthContextType {
  authState: { 
    token: string | null; 
    authenticated: boolean | null;
    user: { email: string } | null;
  };
  register: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
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
}>({ 
  token: null, 
  authenticated: null,
  user: null
});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('JWT_TOKEN');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setAuthState({ token, authenticated: true, user: null });
        }
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);
  useEffect(() => {
    const clearToken = async () => {
      await SecureStore.deleteItemAsync('JWT_TOKEN');
      setAuthState({ token: null, authenticated: false, user: null });
      setIsLoading(false);
    };
    clearToken();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${ENV.API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${ENV.API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    console.log(response.data);
    // Get user data after successful login
    const userResponse = await axios.get(`${ENV.API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`
      }
    });

    setAuthState({ 
      token: response.data.access_token, 
      authenticated: true,
      user: userResponse.data
    });
    
    await SecureStore.setItemAsync('JWT_TOKEN', response.data.access_token);
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};

  const logout = async () => {
  await SecureStore.deleteItemAsync('JWT_TOKEN');
  axios.defaults.headers.common['Authorization'] = '';
  setAuthState({ 
    token: null, 
    authenticated: false,
    user: null
  });
};

  return (
    <AuthContext.Provider
      value={{
        authState,
        register: register,
        login: login,
        logout: logout,
        isLoading,
   }}
>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);