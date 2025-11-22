// ~/styles/FlightDetailsScreen.styles.ts
import { StyleSheet } from 'react-native';

export const createThemedStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
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
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    color: '#ff4444',
    fontSize: 18,
  },
  controlContainer: {
    marginVertical: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  severityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  recommendationsContainer: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.text,
  },
  subResultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.text,
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    opacity: 0.9,
    zIndex: 1000,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12,
  },
  saveButtonText: {
    color: colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default createThemedStyles;