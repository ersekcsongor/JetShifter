// ~/styles/UserDetailsScreen.styles.ts
import { StyleSheet } from 'react-native';

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFC700',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#FFC700',
    flex: 1,
  },
  debugButton: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  debugButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default localStyles;