// UserDetails.styles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',  
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    marginVertical: 8,
  },
  profileImage: {
    borderRadius: 75,
    width: 150,
    height: 150,
    borderColor: 'gray',
    borderWidth: 5,  
  },
  uploadButton: {
    position: 'absolute',
    bottom: 8,                
    right: 8,                 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,

  },imageWrapper: {
    position: 'relative',    
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordButton: {
  backgroundColor: '#2196F3',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 8,
  marginTop: 20,
},
passwordButtonText: {
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
},
});