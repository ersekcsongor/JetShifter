import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    marginBottom: 20
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  icon: {
    marginRight: 5,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    height: 60,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  error: {
    color: '#ff5252',
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  registerButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});