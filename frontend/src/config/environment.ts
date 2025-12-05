interface EnvironmentConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  oauthRedirectUrl: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  
  // 개발 환경에서도 배포된 백엔드 사용 (테스트용)
  const useDeployedBackend = import.meta.env.VITE_USE_DEPLOYED_BACKEND === 'true';
  
  // 프로덕션 환경에서는 항상 배포된 백엔드 사용
  // 개발 환경에서도 기본적으로 배포된 백엔드 사용 (Mixed Content 문제 해결)
  // 명시적으로 false가 설정된 경우에만 로컬 백엔드 사용
  if (isDevelopment && useDeployedBackend === false) {
    return {
      apiBaseUrl: 'http://localhost:8080/api',
      wsBaseUrl: 'http://localhost:8080',
      oauthRedirectUrl: 'http://localhost:8080/oauth2/authorization/kakao'
    };
  } else {
    // 프로덕션 환경에서는 항상 HTTPS 사용
    return {
      apiBaseUrl: 'https://api.promisenow.store/api',
      wsBaseUrl: 'https://api.promisenow.store',
      oauthRedirectUrl: 'https://api.promisenow.store/oauth2/authorization/kakao'
    };
  }
};

export const config = getEnvironmentConfig();


