import { StyleSheet } from 'react-native';

export const createFlightDetailsStyles = (isDarkMode: boolean = false) => StyleSheet.create({
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailSection: {
    marginVertical: 12,
  },
  timezoneInfo: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: isDarkMode ? '#404040' : '#f8f8f8',
    borderRadius: 4,
  },
  controlContainer: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  calculateButton: {
    backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: isDarkMode ? '#4b5563' : '#9ca3af',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default createFlightDetailsStyles;
