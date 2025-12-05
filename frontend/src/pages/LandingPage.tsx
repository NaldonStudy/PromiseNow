import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/user.store';

import LandingTemplate from './templates/LandingTemplate';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    // 사용자 정보가 있으면 홈으로 리다이렉트
    if (isAuthenticated && user) {
      navigate('/home');
    }
  }, [isAuthenticated, user, navigate]);

  return <LandingTemplate />;
};

export default LandingPage;
