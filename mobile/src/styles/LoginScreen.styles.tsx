import { StyleSheet } from "react-native";

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },

  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
  },

  // Input Section
  formContainer: {
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: isDarkMode ? '#e0e0e0' : '#333333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    height: 50,
    fontSize: 16,
  },
  error: {
    color: '#ff5252',
    marginTop: -12,
    marginBottom: 12,
    paddingHorizontal: 4,
    fontSize: 12,
  },

  // Button Section
  loginButton: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonText: {
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  forgotPasswordText: {
    color: isDarkMode ? '#a0a0a0' : '#666666',
    fontSize: 14,
  },

  // Signup Link
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#404040' : '#d0d0d0',
  },
  signupText: {
    color: isDarkMode ? '#a0a0a0' : '#666666',
    fontSize: 14,
  },
  signupLink: {
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
});

export default createThemedStyles;
