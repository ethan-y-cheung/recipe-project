import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
