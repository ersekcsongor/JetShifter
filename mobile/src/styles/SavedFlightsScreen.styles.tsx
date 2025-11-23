import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },

  // Center Container for Loading/Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
  },
  noFlightsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noFlightsSubtext: {
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
  },

  // List Container
  listContainer: {
    paddingBottom: 80,
  },

  // Flight Card Styles
  card: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flightInfo: {
    flex: 1,
  },
  route: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
  },
  flightNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
  },
  label: {
    fontSize: 14,
    color: isDarkMode ? '#e0e0e0' : '#333333',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  sourceLabel: {
    fontSize: 12,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    fontStyle: 'italic',
  },
  unsaveButton: {
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  unsaveButtonText: {
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default createThemedStyles;
