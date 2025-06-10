import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    fontSize: 24,
    color: '#000', // Black text for better visibility on a white background
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  circleButton: {
    backgroundColor: '#007AFF',
    width: 150,           // fixed width
    height: 150,          // same as width
    borderRadius: 100,    // half of width/height
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  accountButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#white',
    borderRadius: 8,
    alignItems: 'center',
  },
  yellowCircleButton: {
    backgroundColor: '#FFC700',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // for Android
  },
  yellowButtonText: {
    color: '#6B5B00',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  dashedLine: {
    width: 60,
    borderBottomWidth: 2,
    borderBottomColor: '#6B5B00',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  helperText: {
    color: '#6B5B00',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  }
});

export default styles;
