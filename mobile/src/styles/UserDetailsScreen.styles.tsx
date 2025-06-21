import { StyleSheet } from 'react-native';

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  modal: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  centeredView: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalView: {
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 25,
  width: '85%',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
},
input: {
  height: 45,
  borderColor: '#ddd',
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 15,
  marginBottom: 15,
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
button: {
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 20,
},
cancelButton: {
  backgroundColor: '#e0e0e0',
},
submitButton: {
  backgroundColor: '#007AFF',
},
buttonText: {
  color: 'black',
  fontWeight: 'bold',
},
errorText: {
  color: 'red',
  marginBottom: 15,
  textAlign: 'center',
},
inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
});

export default localStyles;