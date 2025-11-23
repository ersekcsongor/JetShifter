import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: isDarkMode ? '#404040' : '#b0b0b0',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
  },

  // Cards Container
  cardsContainer: {
    gap: 16,
    marginBottom: 40,
  },

  // Primary Card
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  // Secondary Card
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  // Card Components
  cardIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    lineHeight: 20,
  },

  // Features Section
  featuresSection: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: isDarkMode ? '#e0e0e0' : '#333333',
    fontWeight: '600',
  },

  // Legacy styles (kept for backwards compatibility)
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