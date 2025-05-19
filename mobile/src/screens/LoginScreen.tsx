import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '~/contexts/AuthContext';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from "~/navigation";
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('http://172.20.10.2:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      // Handle successful login
      const responseData = await response.json();
      // Store your token here using AuthContext or async storage
      // Example: await AsyncStorage.setItem('userToken', responseData.token);
      
      navigation.navigate('StartScreen'); // Replace with your post-login screen
      alert('Login successful!');
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

      <Button title="Login" onPress={handleSubmit(handleLogin)} disabled={isSubmitting} />

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Don't have an account? </Text>
        <Button
          title="Register here"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  linkContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
  },
});