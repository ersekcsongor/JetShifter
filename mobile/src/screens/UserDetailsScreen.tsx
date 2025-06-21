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
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '~/contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '~/navigation';
import styles from '~/styles/UserDetails.styles';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import ENV from '~/utils/constants';
import localStyles from '~/styles/UserDetailsScreen.styles';
import { Feather } from '@expo/vector-icons';
import ScreenBackground from '~/components/ScreenBackground';
import DateTimePicker from '@react-native-community/datetimepicker';
type UserData = {
  email: string;
  profileImage: string | null; // Explicitly handle null case
};

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'UserDetailsScreen'>;
};

const UserDetailsScreen = ({ navigation }: Props) => {
  const { authState, logout } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Add these states at the top of your component
  const [adviceNotifications, setAdviceNotifications] = useState(false);
  const [adviceModalVisible, setAdviceModalVisible] = useState(false);

  const [coffeeAdvice, setCoffeeAdvice] = useState(false);
  const [coffeeModalVisible, setCoffeeModalVisible] = useState(false);

  const [useMelatonin, setUseMelatonin] = useState(false);
  const [melatoninModalVisible, setMelatoninModalVisible] = useState(false);

  const [normalSleepPattern, setNormalSleepPattern] = useState(false);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);

  const [chronotype, setChronotype] = useState<'morning' | 'evening' | 'none'>('none');
  const [chronotypeModalVisible, setChronotypeModalVisible] = useState(false);

  // Add these states for sleep time management
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [showBedTimePicker, setShowBedTimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

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
  } catch (error) {
    console.error('Fetch error:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 401) {
    Alert.alert(
      'Session Expired', 
      'Your session has expired. Please log in again.',
      [{ text: 'OK', onPress: () => handleSessionExpiry() }]
    );
  } else {
    // Use replace instead of goBack for safer navigation
    navigation.navigate('LoginScreen'); // Create a fallback screen in your navigator
  }
  } finally {
    setLoading(false);
  }
}, [authState.token, navigation]);

// Add this helper function for session expiration
const handleSessionExpiry = useCallback(async () => {
  await logout();
  navigation.navigate('LoginScreen'); // Changed from reset to replace
}, [logout, navigation]);

  // Fetch on mount and focus
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

      // Update user data and force image refresh
      setUserData(prev => ({
        ...(prev ?? { email: '' }),
        profileImage: uploadResp.data.profileImageUrl,
      }));
      
      // Update cache key to force image reload
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
    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  } catch (err) {
    console.error('Password change error:', err);
    const message =  'Failed to change password';
    setPasswordError(message);
  }
};


  // Update logout handler
const handleLogout = useCallback(async () => {
  try {
    await logout();
    navigation.navigate('LoginScreen'); // Changed from reset to replace
  } catch (error) {
    console.error("Logout failed:", error);
    Alert.alert("Error", "Logout failed. Please try again.");
  }
}, [logout, navigation]);
  if (loading) {
    return (
      <ScreenBackground>
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
      </ScreenBackground>
    );
  }

  return (
  <ScreenBackground>
  <ScrollView>
  <View style={styles.container}>

  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
        {/* You can swap “arrow-back” for any other icon name you like */}
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Center: Title */}
      <Text style={styles.title2}>My Profile</Text>

      {/* Right: Gear/settings button */}
      <TouchableOpacity  style={styles.iconButton}>
        {/* “settings-outline” is the gear icon in Ionicons */}
        <Ionicons name="settings-outline" size={24} color="#333" />
    </TouchableOpacity>
  </View>

  {userData && (
    <>
      <View style={styles.imageWrapper}>
        {userData.profileImage ? (
          (() => {
            // Construct the URI with cache buster
            const imageUri = `${ENV.API_BASE_URL}${userData.profileImage}?v=${imageVersion}`;
            
            // Log the URI to console for debugging
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

        {/* Floating action button */}
          <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="camera-outline" size={32} color="black" />
          </TouchableOpacity>
      </View>
      
      <Text style={styles.detail}>{userData.email}</Text>
          


  
{/* Advice Notifications */}
{/* <TouchableOpacity 
  style={styles.passwordButton}
  onPress={() => setAdviceModalVisible(true)}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <Ionicons name="notifications-outline" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>
      Advice Notifications: {adviceNotifications ? 'ON' : 'OFF'}
    </Text>
  </View>
</TouchableOpacity>
<Modal
  transparent
  visible={adviceModalVisible}
  animationType="fade"
  onRequestClose={() => setAdviceModalVisible(false)}
>
  <View style={localStyles.backdrop}>
    <View style={localStyles.centeredView}>
      <View style={localStyles.modalView}>
        <Text style={localStyles.modalTitle}>Advice Notifications</Text>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setAdviceNotifications(true); setAdviceModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>ON</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setAdviceNotifications(false); setAdviceModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>OFF</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  </View>
</Modal>

{/* Coffee Advice */}
{/* <TouchableOpacity 
  style={styles.passwordButton}
  onPress={() => setCoffeeModalVisible(true)}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <Feather name="coffee" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>
      Coffee Advice: {coffeeAdvice ? 'ON' : 'OFF'}
    </Text>
  </View>
</TouchableOpacity>
<Modal
  transparent
  visible={coffeeModalVisible}
  animationType="fade"
  onRequestClose={() => setCoffeeModalVisible(false)}
>
  <TouchableOpacity
    style={localStyles.backdrop}
    activeOpacity={1}
    onPressOut={() => setCoffeeModalVisible(false)}
  >
    <View style={localStyles.centeredView}>
      <TouchableOpacity
        activeOpacity={1}
        style={localStyles.modalView}
        onPress={() => {}}
      >
        <Text style={localStyles.modalTitle}>Coffee Advice</Text>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setCoffeeAdvice(true); setCoffeeModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>ON</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setCoffeeAdvice(false); setCoffeeModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>OFF</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

{/* Melatonin */}
{/* <TouchableOpacity 
  style={styles.passwordButton}
  onPress={() => setMelatoninModalVisible(true)}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <Feather name="moon" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>
      Use Melatonin: {useMelatonin ? 'Yes' : 'No'}
    </Text>
  </View>
</TouchableOpacity>
<Modal
  transparent
  visible={melatoninModalVisible}
  animationType="fade"
  onRequestClose={() => setMelatoninModalVisible(false)}
>
  <TouchableOpacity
    style={localStyles.backdrop}
    activeOpacity={1}
    onPressOut={() => setMelatoninModalVisible(false)}
  >
    <View style={localStyles.centeredView}>
      <TouchableOpacity
        activeOpacity={1}
        style={localStyles.modalView}
        onPress={() => {}}
      >
        <Text style={localStyles.modalTitle}>Use Melatonin</Text>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setUseMelatonin(true); setMelatoninModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setUseMelatonin(false); setMelatoninModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>No</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal> */}

{/* Normal Sleep Pattern */}
<TouchableOpacity 
  style={styles.passwordButton}
  onPress={() => setSleepModalVisible(true)}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="bed-outline" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>
      Normal Sleep Pattern: {bedTime} - {wakeTime}
    </Text>
  </View>
</TouchableOpacity>
{/* Normal Sleep Pattern Modal */}
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
        style={localStyles.modalView}
        onPress={() => {}}
      >
        <Text style={localStyles.modalTitle}>Normal Sleep Pattern</Text>
        <Text style={{ marginTop: 10 }}>Bed Time:</Text>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => setShowBedTimePicker(true)}
        >
          <Text style={localStyles.buttonText}>{bedTime}</Text>
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
            textColor="black" // <-- Add this line
          />
        )}
        <Text style={{ marginTop: 10 }}>Wake Time:</Text>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => setShowWakeTimePicker(true)}
        >
          <Text style={localStyles.buttonText}>{wakeTime}</Text>
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
            textColor="black" // <-- Add this line
          />
        )}
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => setSleepModalVisible(false)}
        >
          <Text style={localStyles.buttonText}>Save</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

{/* Chronotype */}
{/* <TouchableOpacity 
  style={styles.passwordButton}
  onPress={() => setChronotypeModalVisible(true)}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="yin-yang" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>
      Chronotype: {chronotype === 'morning' ? 'Early Bird' : chronotype === 'evening' ? 'Night Owl' : 'Not set'}
    </Text>
  </View>
</TouchableOpacity>
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
        style={localStyles.modalView}
        onPress={() => {}}
      >
        <Text style={localStyles.modalTitle}>Chronotype</Text>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setChronotype('morning'); setChronotypeModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>Early Bird</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setChronotype('evening'); setChronotypeModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>Night Owl</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.button}
          onPress={() => { setChronotype('none'); setChronotypeModalVisible(false); }}
        >
          <Text style={localStyles.buttonText}>Not set</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal> */}

{/* Change Password Button */}
<TouchableOpacity 
  style={styles.passwordButton}
  onPress={() => setPasswordModalVisible(true)}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      {/* Add your password icon here if needed */}
      <Feather name="lock" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>Change Password</Text>
    
  </View>
</TouchableOpacity>

{/* Logout Button */}
<TouchableOpacity 
  style={styles.passwordButton}
  onPress={handleLogout}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <SimpleLineIcons name="logout" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>Log Out</Text>
  </View>
</TouchableOpacity>

  {/* Password Change Modal */}
  <Modal
  transparent
  visible={passwordModalVisible}
  animationType="slide"
>
  <View style={localStyles.centeredView}>
    <View style={localStyles.modalView}>
      <Text style={localStyles.modalTitle}>Change Password</Text>
      
      {passwordError ? (
        <Text style={localStyles.errorText}>{passwordError}</Text>
      ) : null}
      
      {/* Current Password */}
      <Text style={localStyles.inputLabel}>Current Password</Text>
      <TextInput
        style={localStyles.input}
        placeholder="Enter your current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      
      {/* New Password */}
      <Text style={localStyles.inputLabel}>New Password</Text>
      <TextInput
        style={localStyles.input}
        placeholder="Enter a new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      
      {/* Confirm New Password */}
      <Text style={localStyles.inputLabel}>Confirm New Password</Text>
      <TextInput
        style={localStyles.input}
        placeholder="Re-enter your new password"
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
          <Text style={localStyles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[localStyles.button, localStyles.submitButton]}
          onPress={handlePasswordChange}
        >
          <Text style={localStyles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


          

          {/* Bottom Modal with Icons */}
          <Modal
            transparent
            visible={modalVisible}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity style={localStyles.backdrop} onPress={() => setModalVisible(false)} />
            <View style={localStyles.modal}>
              <TouchableOpacity style={localStyles.iconButton} onPress={() => pickAndUpload(true)}>
                <MaterialCommunityIcons name="camera-outline" size={48} />
                <Text style={localStyles.iconLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={localStyles.iconButton} onPress={() => pickAndUpload(false)}>
                <MaterialCommunityIcons name="image-outline" size={48} />
                <Text style={localStyles.iconLabel}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}


        
    </View>
    </ScrollView>
    </ScreenBackground>
  );
};


export default UserDetailsScreen;