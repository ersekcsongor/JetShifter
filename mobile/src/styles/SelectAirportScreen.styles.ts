import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B5B00',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    color: '#6B5B00',
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 4,
  },
  selectorButton: {
    backgroundColor: '#FFD600',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 6,
  },
  selectorButtonText: {
    color: '#6B5B00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#FFD600',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 6,
  },
  dateButtonText: {
    color: '#6B5B00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#FFD600',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: '#6B5B00',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF9E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B5B00',
    marginTop: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF9E3',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxHeight: '70%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5B00',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#FFD600',
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#6B5B00',
  },
});

export default styles;