// ~/styles/FlightListScreen.styles.ts
import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryDark,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  flightItem: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginVertical: 10,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  flightNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBox: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  time: {
    fontSize: 18,
    color: colors.text,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  airport: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  durationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  duration: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
    marginVertical: 2,
    textAlign: 'center',
  },
  durationLine: {
    height: 2,
    backgroundColor: colors.primary,
    width: 40,
    borderRadius: 1,
    marginVertical: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#B00020',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  noFlightsText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  noFlightsSubtext: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  listFooter: {
    height: 40,
  },
});

export default createThemedStyles;