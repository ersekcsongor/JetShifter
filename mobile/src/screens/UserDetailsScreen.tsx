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
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
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
          


  
<View style={styles.viewBorder}>
{  /* advice notification button */}
<TouchableOpacity 
  style={styles.passwordButton}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <Ionicons name="notifications-outline" size={24} color="black"></Ionicons>
    </View>
    <Text style={styles.passwordButtonText}>Advice Notifications</Text>
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
  </View>
</TouchableOpacity>

{/* coffee advice button */}
<TouchableOpacity 
  style={styles.passwordButton}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
        <Feather name="coffee" size={24} color="black"></Feather>
    </View>
    <Text style={styles.passwordButtonText}>Coffee Advice</Text>
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
  </View>
</TouchableOpacity>

{/* melatonin */}
<TouchableOpacity 
  style={styles.passwordButton}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <Feather name="moon" size={24} color="black"></Feather>
    </View>
    <Text style={styles.passwordButtonText}>Use Melatonin</Text>
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
  </View>
</TouchableOpacity>

{/* normal sleep pattern */}
<TouchableOpacity 
  style={styles.passwordButton}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="bed-outline" size={24} color="black"></MaterialCommunityIcons>
    </View>
    <Text style={styles.passwordButtonText}>Normal Sleep Pattern</Text>
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
  </View>
</TouchableOpacity>

{/* chronotype */}
<TouchableOpacity 
  style={styles.passwordButton}
>
  <View style={styles.buttonContent}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="yin-yang" size={24} color="black" />
    </View>
    <Text style={styles.passwordButtonText}>Chronotype</Text>
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
  </View>
</TouchableOpacity>
</View>


<View style={styles.viewBorder}>
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
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
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
    <View style={styles.chevronContainer}>
      <Text style={styles.chevron}>{'>'}</Text>
    </View>
  </View>
</TouchableOpacity>
</View>
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
  );
};


export default UserDetailsScreen;