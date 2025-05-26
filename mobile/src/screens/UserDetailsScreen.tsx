// UserDetailsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '~/contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from '~/styles/UserDetails.styles';
import { AppStackParamList } from '~/navigation';
import axios from 'axios';

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'UserDetailsScreen'>;
};

const UserDetailsScreen = ({ navigation }: Props) => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
    try {
      const response = await axios.get('http://172.20.10.2:3000/users/me', {
        headers: {
          Authorization: `Bearer ${authState.token}`, // Include JWT token
        },
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      navigation.goBack(); 
    } finally {
      setLoading(false);
    }
  };


    if (authState.authenticated) {
      fetchUserData();
    }
  }, [authState.authenticated]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Details</Text>
      {userData && (
        <>
          <Text style={styles.detail}>Email: {userData.email}</Text>
          {/* Add more fields as needed */}
        </>
      )}
    </View>
  );
};

export default UserDetailsScreen;