import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/user.store';

import LandingTemplate from './templates/LandingTemplate';

const LandingPage = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && userId !== -1) {
      navigate('/home');
    }
  }, [isAuthenticated, userId, navigate]);

  return <LandingTemplate />;
};

export default LandingPage;
