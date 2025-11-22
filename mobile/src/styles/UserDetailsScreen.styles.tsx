// ~/styles/UserDetails.styles.ts
import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  userDetailsView: {
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  iconButton: {
    padding: 8,
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  detail: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  passwordButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  passwordButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});

export default createThemedStyles;

