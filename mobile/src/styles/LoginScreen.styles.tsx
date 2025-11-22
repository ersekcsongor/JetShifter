// ~/styles/LoginScreen.styles.ts
import { StyleSheet } from "react-native";

export const createThemedStyles = (colors: any) => StyleSheet.create({
  logo: {
    marginTop: 100,
    alignSelf: 'center',
    width: 100,
    height: 100,
    marginBottom: 20
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 5,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  error: {
    color: '#ff5252',
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 20,
  },
  loginButtonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 15,
    padding: 10,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default createThemedStyles;