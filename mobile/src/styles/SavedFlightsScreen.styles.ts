import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF9E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#6B5B00',
  },
  label: {
    color: '#6B5B00',
    marginTop: 2,
  },
  flightNumber: {
    fontWeight: 'bold',
  },
  duration: {
    color: '#6B5B00',
    marginTop: 2,
  },
  unsaveButton: {
    backgroundColor: '#FFD600',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  unsaveButtonText: {
    color: '#6B5B00',
    fontWeight: 'bold',
  },
});

export default styles;