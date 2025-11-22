// ~/styles/SavedFlightsScreen.styles.ts
import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 16,
  },
  flightInfo: {
    flex: 1,
  },
  route: {
    fontWeight: 'bold',
    fontSize: 18,
    color: colors.text,
  },
  label: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  flightNumber: {
    fontWeight: 'bold',
    color: colors.text,
  },
  duration: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  unsaveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  unsaveButtonText: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
});

export default createThemedStyles;