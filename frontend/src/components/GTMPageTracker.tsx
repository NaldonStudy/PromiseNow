import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/gtm';

// 페이지 변경 시 자동으로 GTM 페이지뷰 추적
export const GTMPageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 페이지 변경 시 페이지뷰 추적
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return null; // 이 컴포넌트는 렌더링하지 않음
};
