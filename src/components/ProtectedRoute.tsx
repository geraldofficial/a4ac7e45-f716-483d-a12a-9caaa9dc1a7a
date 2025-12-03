import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Add a small timeout to prevent flash redirects
    const timer = setTimeout(() => {
      setHasChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasChecked && !loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, hasChecked]);

  // Show loading while checking auth
  if (loading || !hasChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
