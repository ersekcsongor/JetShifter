import { ThemeProvider } from '~/contexts/ThemeContext';
import { AuthProvider } from '~/contexts/AuthContext';
import MainNavigator from '~/navigation';

export default function App() {
  return (
    <ThemeProvider> 
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </ThemeProvider>  
  );
}