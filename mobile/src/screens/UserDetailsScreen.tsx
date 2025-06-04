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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '~/contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '~/navigation';
import styles from '~/styles/UserDetails.styles';
import { useFocusEffect } from '@react-navigation/native';
import ENV from '~/utils/constants';
import localStyles from '~/styles/UserDetailsScreen.styles';

type UserData = {
  email: string;
  profileImage: string | null; // Explicitly handle null case
};

type Props = {
  navigation: StackNavigationProp<AppStackParamList, 'UserDetailsScreen'>;
};

const UserDetailsScreen = ({ navigation }: Props) => {
  const { authState } = useAuth();
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

  // Unified data fetching function
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${ENV.API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      
      // Ensure consistent data structure
      setUserData({
        email: resp.data.email,
        profileImage: resp.data.profileImageUrl  || null
      });
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load profile data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [authState.token, navigation]);

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
      </View>
      
      <Text style={styles.detail}>Email: {userData.email}</Text>
          


            {/* Add password change button */}
  <TouchableOpacity 
    style={styles.passwordButton}
    onPress={() => setPasswordModalVisible(true)}
  >
    <Text style={styles.passwordButtonText}>Change Password</Text>
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


          {/* Floating action button */}
          <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="camera-plus-outline" size={32} color="white" />
          </TouchableOpacity>

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