import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,},
  tagline: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  circleButton: {
    backgroundColor: '#007AFF',
    width: 150,
    height: 150,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  accountButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  yellowCircleButton: {
    backgroundColor: colors.primary,
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  yellowButtonText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dashedLine: {
    width: 60,
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryDark,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 20,
  }
});

// Legacy export for backwards compatibility (optional)
// You can remove this once all screens are updated
export default createThemedStyles({
  background: '#fbf2d5',
  surface: '#fbf2d5',
  primary: '#FFC700',
  primaryDark: '#6B5B00',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
});