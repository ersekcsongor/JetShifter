import { ThemeProvider } from '~/contexts/ThemeContext';
import { AuthProvider } from '~/contexts/AuthContext';
import { NotificationProvider } from '~/contexts/NotificationContext';
import MainNavigator from '~/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainNavigator />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}