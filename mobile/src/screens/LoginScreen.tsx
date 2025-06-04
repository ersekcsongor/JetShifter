import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '~/contexts/AuthContext';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from "~/navigation";
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import styles from '~/styles/LoginScreen.styles';

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
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jetlag Calculator Login</Text>

      {/* Email Input */}
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
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password Input */}
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
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {/* Login Button */}
      <Button 
        title="Login" 
        onPress={handleSubmit(handleLogin)} 
        disabled={isSubmitting} 
      />

      {/* Registration Link */}
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don't have an account? </Text>
        <Button
          title="Register here"
          onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
        />
      </View>
    </View>
  );
}

