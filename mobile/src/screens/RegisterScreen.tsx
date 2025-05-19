import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '~/contexts/AuthContext';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '~/navigation';
import { Button, TextInput, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();  const { onRegister, isLoading } = useAuth();
  const password = watch('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // In your RegisterScreen component
const handleRegister = async (data: FormValues) => {
  try {
    setIsSubmitting(true);
    
    const response = await fetch('http://172.20.10.2:3000/auth/register', {
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

    navigation.navigate('Login');
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

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
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
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
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

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
            secureTextEntry
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

      <Button title="Register" onPress={handleSubmit(handleRegister)} />

      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>Already have an account? </Text>
        <Button
          title="Login here"
          onPress={() => navigation.navigate('Login')}
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