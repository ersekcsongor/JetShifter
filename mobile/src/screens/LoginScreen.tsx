import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '~/contexts/AuthContext';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from "~/navigation";
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ImageBackground } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import styles from '~/styles/LoginScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import ScreenBackground from '~/components/ScreenBackground';
type LoginScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'Login'>,
  StackNavigationProp<RootStackParamList>
>;
interface LoginFormData {
  email: string;
  password: string;
}
type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      navigation.navigate('App', { screen: 'StartScreen' });
    } catch (error) {
      alert((error as Error).message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <ScreenBackground>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>

      {/* Add logo */}
      <Image 
        style={styles.logo} 
        source={require('~/assets/jet-lag.png')} 
      />

      <Text style={styles.title}>JetShifter</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="black" style={styles.icon} />
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email format',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="black" style={styles.icon} />
        <Controller
          control={control}
          name="password"
          rules={{ 
            required: 'Password is required', 
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleSubmit(handleLogin)}
        disabled={isSubmitting}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => console.log('Forgot password pressed')}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't you have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
        <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}