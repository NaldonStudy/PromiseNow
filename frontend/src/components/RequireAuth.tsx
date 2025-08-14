import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/user.store';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  return <>{children}</>;
};

export default RequireAuth;
