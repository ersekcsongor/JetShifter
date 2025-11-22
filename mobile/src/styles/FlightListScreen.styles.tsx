import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  noFlightsText: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  noFlightsSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingBottom: 16,
  },
  listFooter: {
    height: 20,
  },
});

export default createThemedStyles;
