import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
  },

  // Selection Cards
  selectionCard: {
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? '#e0e0e0' : '#333333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  selectorButton: {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectorButtonText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    flex: 1,
  },

  placeholderText: {
    fontSize: 16,
    color: isDarkMode ? '#666666' : '#999999',
  },

  dateButton: {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateButtonText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
  },

  searchButton: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    padding: 18,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  searchButtonText: {
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 16,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDarkMode ? '#404040' : '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchInput: {
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: isDarkMode ? '#404040' : '#d0d0d0',
    borderRadius: 12,
    padding: 12,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    fontSize: 16,
  },

  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#404040' : '#e8e8e8',
    borderRadius: 8,
    marginBottom: 4,
  },

  modalItemText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 2,
  },

  modalItemSubtext: {
    fontSize: 12,
    color: isDarkMode ? '#a0a0a0' : '#666666',
  },

  emptyState: {
    padding: 40,
    alignItems: 'center',
  },

  emptyStateText: {
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
  },

  cancelButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default createThemedStyles;
