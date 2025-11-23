import React from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { AuthStackParamList, RootStackParamList } from '~/navigation';
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ENV from '~/utils/constants';
import { createThemedStyles } from '~/styles/RegisterScreen.styles';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/contexts/ThemeContext';
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
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const { register, isLoading } = useAuth();
  const password = watch('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
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

  if (isLoading || isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={iconColor} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={require('~/assets/jet-lag.png')}
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to start managing your jet lag</Text>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Email Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={iconColor} style={styles.icon} />
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
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        {/* Password Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.icon} />
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
                  placeholder="Enter your password"
                  placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
                  secureTextEntry
                  autoComplete="password-new"
                  textContentType="newPassword"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        {/* Confirm Password Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.icon} />
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
                  placeholder="Re-enter your password"
                  placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
                  secureTextEntry
                  autoComplete="password-new"
                  textContentType="newPassword"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}
      </View>

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
    </ScrollView>
  );
}