import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '~/contexts/AuthContext';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from '~/navigation';
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ENV from '~/utils/constants';
import styles from '~/styles/RegisterScreen.styles';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
type LoginScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, 'Register'>,
  StackNavigationProp<RootStackParamList>
>;

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterScreenProps = {
  navigation: LoginScreenNavigationProp;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();  const { register, isLoading } = useAuth();
  const password = watch('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // In your RegisterScreen component
const handleRegister = async (data: FormValues) => {
  try {
    setIsSubmitting(true);
    const response = await fetch(`${ENV.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

// In RegisterScreen's success handler
  navigation.navigate('Auth', { screen: 'Login' });
  alert('Registration successful! Please login.');

  } catch (error) {
    alert((error as Error).message || 'Registration failed. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
 if (isSubmitting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add logo */}
      <Image 
        style={styles.logo} 
        source={require('~/assets/jet-lag.png')} 
      />

      <Text style={styles.title}>Create Account</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="black" style={styles.icon} />
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
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
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="black" style={styles.icon} />
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Confirm your password',
            validate: value => value === password || 'Passwords do not match'
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
          )}
        />
      </View>
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

      {/* Register Button */}
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={handleSubmit(handleRegister)}
        disabled={isSubmitting}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}