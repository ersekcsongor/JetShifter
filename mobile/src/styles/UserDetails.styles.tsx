// UserDetails.styles.ts
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',  
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  detail: {
    fontSize: 18,
    marginVertical: 8,
    fontWeight: '500',
  },
  profileImage: {
    borderRadius: 75,
    width: 150,
    height: 150,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 8,                
    right: 8,                 
    backgroundColor: 'white', 
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
  display: 'flex',
  backgroundColor: 'white',
  paddingVertical: 12,
  borderRadius: 8,
  marginTop: 20,
  marginRight: 10,
},
buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  fontWeight: '500',
},
iconContainer: {
  width: 24, // Match icon width
  alignItems: 'flex-start',
  marginLeft: 8, // Add some left margin for spacing
  marginRight: 1, // Add some right margin for spacing
},
chevronContainer: {
  width: 24, // Match chevron width
  alignItems: 'flex-end',
},
passwordButtonText: {
  flex: 1,
  textAlign: 'center',
},
chevron: {
  fontSize: 18,
  fontWeight: 'bold',
},
 header: {
    height: 56,                    // adjust as needed
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',       // header background
  },
  iconButton: {
    width: 40,                     // hit‐area for the icon
    alignItems: 'center',
    justifyContent: 'center',
  },
  title2: {
    flex: 1,                       // take up remaining space
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  }
  });