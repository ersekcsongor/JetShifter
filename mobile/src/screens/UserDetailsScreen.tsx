// UserDetailsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons, Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '~/contexts/AuthContext';
import { useTheme } from '~/contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '~/navigation';
import { createThemedStyles } from '~/styles/UserDetailsScreen.styles';
import { useFocusEffect } from '@react-navigation/native';
import ENV from '~/utils/constants';
import { createLocalStyles } from '~/styles/UserDetails.styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleLocalNotification } from '~/services/notificationService';
import { useNotifications } from '~/contexts/NotificationContext';

type UserData = {
  email: string;
  profileImage: string | null;
};

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'UserDetailsScreen'>;
};

const UserDetailsScreen = ({ navigation }: Props) => {
  const { authState, logout } = useAuth();
  const { theme, setTheme, colors, effectiveTheme } = useTheme();
  const { permissionsGranted } = useNotifications();
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createThemedStyles(colors, isDarkMode);
  const localStyles = createLocalStyles(colors, isDarkMode);
  const iconColor = isDarkMode ? '#ffffff' : '#1a1a1a';
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Theme modal
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // Sleep pattern states
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  // Melatonin and Coffee states
  const [useMelatonin, setUseMelatonin] = useState(false);
  const [useCoffee, setUseCoffee] = useState(false);

  // Chronotype state and modal
  const [chronotype, setChronotype] = useState<'morning' | 'evening' | 'intermediate'>('intermediate');
  const [chronotypeModalVisible, setChronotypeModalVisible] = useState(false);

  // Save sleep times to backend
  const saveSleepTimes = async (newBedTime: string, newWakeTime: string) => {
    try {
      await axios.patch(
        `${ENV.API_BASE_URL}/users/update-sleep-times`,
        {
          bedtime: newBedTime,
          wakeupTime: newWakeTime,
        },
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      // Also save to AsyncStorage for offline access
      await AsyncStorage.setItem('userBedTime', newBedTime);
      await AsyncStorage.setItem('userWakeTime', newWakeTime);

      Alert.alert('Success', 'Sleep times updated successfully');
    } catch (error) {
      console.error('Error saving sleep times:', error);
      Alert.alert('Error', 'Failed to save sleep times');
    }
  };

  // Save melatonin/coffee preferences
  const saveSupplementPreferences = async (melatonin: boolean, coffee: boolean) => {
    try {
      await axios.patch(
        `${ENV.API_BASE_URL}/users/update-preferences`,
        {
          useMelatonin: melatonin,
          useCoffee: coffee,
        },
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  // Save chronotype
  const saveChronotype = async (newChronotype: 'morning' | 'evening' | 'intermediate') => {
    try {
      await axios.patch(
        `${ENV.API_BASE_URL}/users/update-chronotype`,
        {
          chronotype: newChronotype,
        },
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );
      setChronotype(newChronotype);
      Alert.alert('Success', 'Chronotype updated successfully');
    } catch (error) {
      console.error('Error saving chronotype:', error);
      Alert.alert('Error', 'Failed to save chronotype');
    }
  };

  // Ask for permissions on mount
  useEffect(() => {
    (async () => {
      const [libStatus, camStatus] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        ImagePicker.requestCameraPermissionsAsync()
      ]);
      
      if (libStatus.status !== 'granted' || camStatus.status !== 'granted') {
        Alert.alert('Permissions Required', 'Please enable camera & photo library permissions.');
      }
    })();
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${ENV.API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });

      setUserData({
        email: resp.data.email,
        profileImage: resp.data.profileImageUrl || null
      });

      // Load sleep times from backend
      if (resp.data.bedtime && resp.data.wakeupTime) {
        setBedTime(resp.data.bedtime);
        setWakeTime(resp.data.wakeupTime);

        // Also save to AsyncStorage for offline access
        await AsyncStorage.setItem('userBedTime', resp.data.bedtime);
        await AsyncStorage.setItem('userWakeTime', resp.data.wakeupTime);
      }

      // Load melatonin and coffee preferences
      if (resp.data.useMelatonin !== undefined) {
        setUseMelatonin(resp.data.useMelatonin);
      }
      if (resp.data.useCoffee !== undefined) {
        setUseCoffee(resp.data.useCoffee);
      }

      // Load chronotype
      if (resp.data.chronotype) {
        setChronotype(resp.data.chronotype);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Alert.alert(
          'Session Expired', 
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => handleSessionExpiry() }]
        );
      } else {
        navigation.navigate('LoginScreen');
      }
    } finally {
      setLoading(false);
    }
  }, [authState.token, navigation]);

  const handleSessionExpiry = useCallback(async () => {
    await logout();
    navigation.navigate('LoginScreen');
  }, [logout, navigation]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      setImageVersion(prev => prev + 1);
    }, [fetchUserData])
  );

  const pickAndUpload = async (fromCamera: boolean) => {
    try {
      setModalVisible(false);
      
      const pickerResult = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });

      if (pickerResult.canceled) return;

      const asset = pickerResult.assets[0];
      const uri = asset.uri;
      const name = uri.split('/').pop() || `profile-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(name);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('profile', { 
        uri, 
        name, 
        type 
      } as any);

      const uploadResp = await axios.patch(
        `${ENV.API_BASE_URL}/users/upload-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      ); 

      setUserData(prev => ({
        ...(prev ?? { email: '' }),
        profileImage: uploadResp.data.profileImageUrl,
      }));
      
      setImageVersion(prev => prev + 1);
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', 'Could not upload image.');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      await axios.patch(
        `${ENV.API_BASE_URL}/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      
      Alert.alert("Success", "Password changed successfully");
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (err) {
      console.error('Password change error:', err);
      const message = 'Failed to change password';
      setPasswordError(message);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  }, [logout, navigation]);

  const handleTestNotification = async () => {
    try {
      if (!permissionsGranted) {
        Alert.alert('Permissions Required', 'Please grant notification permissions first.');
        return;
      }

      // Log JWT token for debugging
      console.log('🔑 JWT TOKEN:', authState.token);

      await scheduleLocalNotification(
        '✈️ Test Notification',
        'This is a test notification from JetShifter! It will appear in 5 seconds.',
        5
      );
      Alert.alert('Success', 'Test notification scheduled! It will appear in 5 seconds.');
      console.log('Permissions granted:', permissionsGranted);
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      Alert.alert('Error', 'Failed to schedule notification.');
    }
  };

  const handleTestFirebasePush = async () => {
    try {
      if (!authState.user?.email) {
        Alert.alert('Error', 'You must be logged in to test Firebase push notifications.');
        return;
      }

      console.log('🚀 Sending Firebase push notification from server...');

      const response = await axios.post(
        `${ENV.API_BASE_URL}/notifications/send`,
        {
          email: authState.user.email,
          title: '🔥 Firebase Push Notification',
          body: 'This notification was sent from the server via Firebase Cloud Messaging!',
          data: { type: 'test', timestamp: new Date().toISOString() }
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`
          }
        }
      );

      console.log('✅ Server response:', response.data);
      Alert.alert('Success', 'Firebase push notification sent from server! Check your notification tray.');
    } catch (error) {
      console.error('❌ Failed to send Firebase push notification:', error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to send Firebase push notification from server.');
      } else {
        Alert.alert('Error', 'Failed to send Firebase push notification from server.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={iconColor} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userDetailsView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>

          <Text style={styles.title2}>My Profile</Text>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>

          {userData && (
            <>
              <View style={styles.imageWrapper}>
                {userData.profileImage ? (
                  (() => {
                    // Check if profileImage is already a full URL (Firebase Storage) or a relative path
                    const isFullUrl = userData.profileImage.startsWith('http://') || userData.profileImage.startsWith('https://');
                    const imageUri = isFullUrl
                      ? `${userData.profileImage}?v=${imageVersion}`
                      : `${ENV.API_BASE_URL}${userData.profileImage}?v=${imageVersion}`;
                    console.log('Profile Image URI:', imageUri);

                    return (
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.profileImage}
                        onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                      />
                    );
                  })()
                ) : (
                  <View style={styles.profileImage} />
                )}

                <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
                  <MaterialCommunityIcons name="camera-outline" size={24} color={iconColor} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.detail}>{userData.email}</Text>

              {/* Theme Toggle Button */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setThemeModalVisible(true)}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={theme === 'dark' ? 'moon' : theme === 'light' ? 'sunny' : 'phone-portrait'}
                      size={22}
                      color={iconColor}
                    />
                  </View>
                  <Text style={styles.passwordButtonText}>
                    Theme: {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Normal Sleep Pattern */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setSleepModalVisible(true)}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="bed-outline" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>
                    Sleep Pattern: {bedTime} - {wakeTime}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Melatonin Toggle */}
              <View style={styles.passwordButton}>
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="pill" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>
                    Use Melatonin
                  </Text>
                  <Switch
                    value={useMelatonin}
                    onValueChange={(value) => {
                      setUseMelatonin(value);
                      saveSupplementPreferences(value, useCoffee);
                    }}
                    trackColor={{ false: isDarkMode ? '#4b5563' : '#d1d5db', true: isDarkMode ? '#3b82f6' : '#2563eb' }}
                    thumbColor={useMelatonin ? '#ffffff' : '#f3f4f6'}
                  />
                </View>
              </View>

              {/* Coffee Toggle */}
              <View style={styles.passwordButton}>
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="coffee" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>
                    Use Coffee
                  </Text>
                  <Switch
                    value={useCoffee}
                    onValueChange={(value) => {
                      setUseCoffee(value);
                      saveSupplementPreferences(useMelatonin, value);
                    }}
                    trackColor={{ false: isDarkMode ? '#4b5563' : '#d1d5db', true: isDarkMode ? '#3b82f6' : '#2563eb' }}
                    thumbColor={useCoffee ? '#ffffff' : '#f3f4f6'}
                  />
                </View>
              </View>

              {/* Chronotype Selector */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setChronotypeModalVisible(true)}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={chronotype === 'morning' ? 'sunny' : chronotype === 'evening' ? 'moon' : 'partly-sunny'}
                      size={22}
                      color={iconColor}
                    />
                  </View>
                  <Text style={styles.passwordButtonText}>
                    Chronotype: {chronotype === 'morning' ? 'Morning Bird' : chronotype === 'evening' ? 'Night Owl' : 'In Between'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Change Password Button */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setPasswordModalVisible(true)}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Feather name="lock" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>Change Password</Text>
                </View>
              </TouchableOpacity>

              {/* Test Local Notification Button */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={handleTestNotification}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="notifications-outline" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>Test Local Notification</Text>
                </View>
              </TouchableOpacity>

              {/* Test Firebase Push Button */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={handleTestFirebasePush}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="cloud-upload-outline" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>Test Firebase Push</Text>
                </View>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={handleLogout}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.iconContainer}>
                    <SimpleLineIcons name="logout" size={22} color={iconColor} />
                  </View>
                  <Text style={styles.passwordButtonText}>Log Out</Text>
                </View>
              </TouchableOpacity>

              {/* Theme Modal */}
              <Modal
                transparent
                visible={themeModalVisible}
                animationType="fade"
                onRequestClose={() => setThemeModalVisible(false)}
              >
                <TouchableOpacity
                  style={localStyles.backdrop}
                  activeOpacity={1}
                  onPressOut={() => setThemeModalVisible(false)}
                >
                  <View style={localStyles.centeredView}>
                    <TouchableOpacity
                      activeOpacity={1}
                      style={[localStyles.modalView, { backgroundColor: colors.surface }]}
                      onPress={() => {}}
                    >
                      <Text style={[localStyles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
                      
                      <TouchableOpacity
                        style={[
                          localStyles.button,
                          { backgroundColor: theme === 'light' ? (isDarkMode ? '#404040' : '#e0e0e0') : colors.surface },
                          { borderWidth: 1, borderColor: theme === 'light' ? (isDarkMode ? '#666666' : '#b0b0b0') : colors.border }
                        ]}
                        onPress={() => { setTheme('light'); setThemeModalVisible(false); }}
                      >
                        <Ionicons name="sunny" size={24} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>Light</Text>
                        {theme === 'light' && (
                          <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? '#3b82f6' : '#2563eb'} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          localStyles.button,
                          { backgroundColor: theme === 'dark' ? (isDarkMode ? '#404040' : '#e0e0e0') : colors.surface },
                          { borderWidth: 1, borderColor: theme === 'dark' ? (isDarkMode ? '#666666' : '#b0b0b0') : colors.border }
                        ]}
                        onPress={() => { setTheme('dark'); setThemeModalVisible(false); }}
                      >
                        <Ionicons name="moon" size={24} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>Dark</Text>
                        {theme === 'dark' && (
                          <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? '#3b82f6' : '#2563eb'} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          localStyles.button,
                          { backgroundColor: theme === 'system' ? (isDarkMode ? '#404040' : '#e0e0e0') : colors.surface },
                          { borderWidth: 1, borderColor: theme === 'system' ? (isDarkMode ? '#666666' : '#b0b0b0') : colors.border }
                        ]}
                        onPress={() => { setTheme('system'); setThemeModalVisible(false); }}
                      >
                        <Ionicons name="phone-portrait" size={24} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>System</Text>
                        {theme === 'system' && (
                          <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? '#3b82f6' : '#2563eb'} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Sleep Pattern Modal */}
              <Modal
                transparent
                visible={sleepModalVisible}
                animationType="fade"
                onRequestClose={() => setSleepModalVisible(false)}
              >
                <TouchableOpacity
                  style={localStyles.backdrop}
                  activeOpacity={1}
                  onPressOut={() => setSleepModalVisible(false)}
                >
                  <View style={localStyles.centeredView}>
                    <TouchableOpacity
                      activeOpacity={1}
                      style={[localStyles.modalView, { backgroundColor: colors.surface }]}
                      onPress={() => {}}
                    >
                      <Text style={[localStyles.modalTitle, { color: colors.text }]}>Sleep Pattern</Text>
                      
                      <Text style={[localStyles.inputLabel, { color: colors.text }]}>Bed Time:</Text>
                      <TouchableOpacity
                        style={[localStyles.button, { backgroundColor: isDarkMode ? '#404040' : '#e0e0e0' }]}
                        onPress={() => setShowBedTimePicker(true)}
                      >
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>{bedTime}</Text>
                      </TouchableOpacity>
                      {showBedTimePicker && (
                        <DateTimePicker
                          value={new Date(`1970-01-01T${bedTime}:00`)}
                          mode="time"
                          display="spinner"
                          onChange={(_event, selectedTime) => {
                            setShowBedTimePicker(false);
                            if (selectedTime) {
                              const hours = selectedTime.getHours().toString().padStart(2, '0');
                              const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                              setBedTime(`${hours}:${minutes}`);
                            }
                          }}
                          textColor={colors.text}
                        />
                      )}
                      
                      <Text style={[localStyles.inputLabel, { color: colors.text }]}>Wake Time:</Text>
                      <TouchableOpacity
                        style={[localStyles.button, { backgroundColor: isDarkMode ? '#404040' : '#e0e0e0' }]}
                        onPress={() => setShowWakeTimePicker(true)}
                      >
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>{wakeTime}</Text>
                      </TouchableOpacity>
                      {showWakeTimePicker && (
                        <DateTimePicker
                          value={new Date(`1970-01-01T${wakeTime}:00`)}
                          mode="time"
                          display="spinner"
                          onChange={(_event, selectedTime) => {
                            setShowWakeTimePicker(false);
                            if (selectedTime) {
                              const hours = selectedTime.getHours().toString().padStart(2, '0');
                              const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                              setWakeTime(`${hours}:${minutes}`);
                            }
                          }}
                          textColor={colors.text}
                        />
                      )}
                      
                      <TouchableOpacity
                        style={[localStyles.button, { backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb' }]}
                        onPress={() => {
                          saveSleepTimes(bedTime, wakeTime);
                          setSleepModalVisible(false);
                        }}
                      >
                        <Text style={[localStyles.buttonText, { color: '#ffffff' }]}>Save</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Chronotype Modal */}
              <Modal
                transparent
                visible={chronotypeModalVisible}
                animationType="fade"
                onRequestClose={() => setChronotypeModalVisible(false)}
              >
                <TouchableOpacity
                  style={localStyles.backdrop}
                  activeOpacity={1}
                  onPressOut={() => setChronotypeModalVisible(false)}
                >
                  <View style={localStyles.centeredView}>
                    <TouchableOpacity
                      activeOpacity={1}
                      style={[localStyles.modalView, { backgroundColor: colors.surface }]}
                      onPress={() => {}}
                    >
                      <Text style={[localStyles.modalTitle, { color: colors.text }]}>Choose Your Chronotype</Text>
                      <Text style={[localStyles.inputLabel, { color: colors.textSecondary, marginBottom: 16, textAlign: 'center' }]}>
                        This adjusts light exposure and supplement timing based on your circadian rhythm
                      </Text>

                      <TouchableOpacity
                        style={[
                          localStyles.button,
                          { backgroundColor: chronotype === 'morning' ? (isDarkMode ? '#404040' : '#e0e0e0') : colors.surface },
                          { borderWidth: 1, borderColor: chronotype === 'morning' ? (isDarkMode ? '#666666' : '#b0b0b0') : colors.border }
                        ]}
                        onPress={() => {
                          saveChronotype('morning');
                          setChronotypeModalVisible(false);
                        }}
                      >
                        <Ionicons name="sunny" size={24} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>Morning Bird</Text>
                        {chronotype === 'morning' && (
                          <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? '#3b82f6' : '#2563eb'} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          localStyles.button,
                          { backgroundColor: chronotype === 'intermediate' ? (isDarkMode ? '#404040' : '#e0e0e0') : colors.surface },
                          { borderWidth: 1, borderColor: chronotype === 'intermediate' ? (isDarkMode ? '#666666' : '#b0b0b0') : colors.border }
                        ]}
                        onPress={() => {
                          saveChronotype('intermediate');
                          setChronotypeModalVisible(false);
                        }}
                      >
                        <Ionicons name="partly-sunny" size={24} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>In Between</Text>
                        {chronotype === 'intermediate' && (
                          <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? '#3b82f6' : '#2563eb'} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          localStyles.button,
                          { backgroundColor: chronotype === 'evening' ? (isDarkMode ? '#404040' : '#e0e0e0') : colors.surface },
                          { borderWidth: 1, borderColor: chronotype === 'evening' ? (isDarkMode ? '#666666' : '#b0b0b0') : colors.border }
                        ]}
                        onPress={() => {
                          saveChronotype('evening');
                          setChronotypeModalVisible(false);
                        }}
                      >
                        <Ionicons name="moon" size={24} color={colors.text} style={{ marginRight: 8 }} />
                        <Text style={[localStyles.buttonText, { color: colors.text }]}>Night Owl</Text>
                        {chronotype === 'evening' && (
                          <Ionicons name="checkmark-circle" size={24} color={isDarkMode ? '#3b82f6' : '#2563eb'} style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

              {/* Password Change Modal */}
              <Modal
                transparent
                visible={passwordModalVisible}
                animationType="slide"
              >
                <View style={localStyles.centeredView}>
                  <View style={[localStyles.modalView, { backgroundColor: colors.surface }]}>
                    <Text style={[localStyles.modalTitle, { color: colors.text }]}>Change Password</Text>
                    
                    {passwordError ? (
                      <Text style={localStyles.errorText}>{passwordError}</Text>
                    ) : null}
                    
                    <Text style={[localStyles.inputLabel, { color: colors.text }]}>Current Password</Text>
                    <TextInput
                      style={[localStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="Enter your current password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                    
                    <Text style={[localStyles.inputLabel, { color: colors.text }]}>New Password</Text>
                    <TextInput
                      style={[localStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="Enter a new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    
                    <Text style={[localStyles.inputLabel, { color: colors.text }]}>Confirm New Password</Text>
                    <TextInput
                      style={[localStyles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                      placeholder="Re-enter your new password"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    
                    <View style={localStyles.buttonRow}>
                      <TouchableOpacity
                        style={[localStyles.button, localStyles.cancelButton]}
                        onPress={() => {
                          setPasswordModalVisible(false);
                          setPasswordError('');
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        <Text style={[localStyles.buttonText, { color: isDarkMode ? '#ffffff' : colors.text }]}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[localStyles.button, localStyles.button, { backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb' }]}
                        onPress={handlePasswordChange}
                      >
                        <Text style={[localStyles.buttonText, { color: isDarkMode ? '#ffffff' : '#fff' }]}>Update</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* Image Picker Modal */}
              <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
              >
                <TouchableOpacity 
                  style={localStyles.backdrop} 
                  onPress={() => setModalVisible(false)} 
                  activeOpacity={1}
                />
                <View style={localStyles.modal}>
                  <TouchableOpacity 
                    style={localStyles.iconButton} 
                    onPress={() => pickAndUpload(true)}
                  >
                    <MaterialCommunityIcons name="camera-outline" size={48} color="#333" />
                    <Text style={localStyles.iconLabel}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={localStyles.iconButton} 
                    onPress={() => pickAndUpload(false)}
                  >
                    <MaterialCommunityIcons name="image-outline" size={48} color="#333" />
                    <Text style={localStyles.iconLabel}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </>
          )}
        </View>
      </ScrollView>
  );
};

export default UserDetailsScreen;