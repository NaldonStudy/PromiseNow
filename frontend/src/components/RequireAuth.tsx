import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/user.store';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated || userId === -1) {
      navigate('/');
    }
  }, [isAuthenticated, userId, navigate]);

  return <>{children}</>;
};

export default RequireAuth;
