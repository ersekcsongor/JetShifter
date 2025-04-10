import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  controlContainer: {
    marginVertical: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  severityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recommendationsContainer: {
    marginTop: 12,
  },
  recommendationBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  recommendationTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50'
  },
  subResultContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
 
  calculateButton: {
    backgroundColor: '#f5f5f5', 
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#a8b5c8', 
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles