import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LangProvider } from './context/LangContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </LangProvider>
  );
}
