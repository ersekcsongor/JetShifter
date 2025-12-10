import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any, isDarkMode: boolean = false) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
  },

  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
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

  // Search Section
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    padding: 4,
  },

  // Date Section
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: isDarkMode ? '#e0e0e0' : '#333333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateButton: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    fontWeight: '600',
  },

  // Routes Container
  routesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  // Route Card
  routeCard: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  routeContent: {
    flex: 1,
    marginRight: 12,
  },
  routeAirports: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  airportBlock: {
    flex: 1,
    alignItems: 'center',
  },
  airportCodeLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },
  airportName: {
    fontSize: 12,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
  },
  airplaneIcon: {
    marginHorizontal: 12,
  },

  // Flights Container
  flightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  // Flight Card
  flightCard: {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDarkMode ? 0.25 : 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  flightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#404040' : '#d0d0d0',
  },
  flightNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
  },
  airlineBadge: {
    backgroundColor: isDarkMode ? '#404040' : '#d0d0d0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  airlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: isDarkMode ? '#e0e0e0' : '#333333',
  },

  // Flight Time Row
  flightTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 11,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },
  airportCode: {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? '#e0e0e0' : '#333333',
  },
  flightDurationContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  durationText: {
    fontSize: 12,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    marginTop: 4,
    fontWeight: '600',
  },

  // Flight Footer
  flightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? '#404040' : '#d0d0d0',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  frequencyText: {
    fontSize: 13,
    color: isDarkMode ? '#e0e0e0' : '#333333',
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    textAlign: 'center',
    marginTop: 16,
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#666666',
    lineHeight: 20,
  },
});

export default createThemedStyles;
