import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    marginBottom: 20
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
    borderRadius: 8,
  },
  icon: {
    marginRight: 5,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    height: 60,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  error: {
    color: '#ff5252',
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  registerButton: {
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
  },
  registerButtonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default createThemedStyles;