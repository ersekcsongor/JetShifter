import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
  },

  // Form
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: isDarkMode ? '#e0e0e0' : '#333333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: isDarkMode ? '#888888' : '#666666',
    marginTop: 8,
    marginLeft: 4,
  },

  // Date Button
  dateButton: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontWeight: '600',
  },

  // Search Button
  searchButton: {
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonDisabled: {
    backgroundColor: isDarkMode ? '#404040' : '#cccccc',
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#e0e0e0' : '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    lineHeight: 22,
  },

  // Examples Section
  examplesSection: {
    paddingHorizontal: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: isDarkMode ? '#a0a0a0' : '#666666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleChip: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? '#404040' : '#d0d0d0',
  },
  exampleCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },
  exampleAirline: {
    fontSize: 12,
    color: isDarkMode ? '#a0a0a0' : '#666666',
  },
});

export default createThemedStyles;
