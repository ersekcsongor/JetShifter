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

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
  },

  // Cards Container
  cardsContainer: {
    gap: 20,
    marginBottom: 30,
  },

  // Primary Card (RyanAir)
  primaryCard: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Secondary Card (Custom)
  secondaryCard: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },

  cardDescription: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    lineHeight: 20,
  },

  // Card Features
  cardFeatures: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#404040' : '#d0d0d0',
    gap: 10,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  featureText: {
    fontSize: 14,
    color: isDarkMode ? '#e0e0e0' : '#333333',
    fontWeight: '500',
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    lineHeight: 20,
  },
});

export default createThemedStyles;
