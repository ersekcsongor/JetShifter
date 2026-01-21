import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '~/contexts/AuthContext';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from "~/navigation";
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ImageBackground, Alert, ScrollView } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { createThemedStyles } from '~/styles/LoginScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useTheme } from '~/contexts/ThemeContext';
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
  const { login, enterOfflineMode } = useAuth();
  const { colors, effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      navigation.navigate('App', { screen: 'StartScreen' });
    } catch (error) {
    Alert.alert('Error', (error as Error).message);
    console.log(error);
  } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
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
        <Text style={styles.title}>JetShifter</Text>
        <Text style={styles.subtitle}>Welcome back! Please login to continue</Text>
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
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email format',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
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
                  autoComplete="password"
                  textContentType="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSubmit(handleLogin)}
        disabled={isSubmitting}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => console.log('Forgot password pressed')}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Mode Button */}
      <TouchableOpacity
        style={styles.offlineButton}
        onPress={enterOfflineMode}
      >
        <Ionicons name="airplane-outline" size={20} color={iconColor} style={{ marginRight: 8 }} />
        <Text style={styles.offlineButtonText}>Continue Offline</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}