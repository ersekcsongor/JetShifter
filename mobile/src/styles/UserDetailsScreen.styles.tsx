import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  userDetailsView: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderWidth: 3,
    borderColor: isDarkMode ? '#404040' : '#d0d0d0',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  detail: {
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  passwordButton: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  passwordButtonText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontWeight: '600',
  },
});

export default createThemedStyles;

