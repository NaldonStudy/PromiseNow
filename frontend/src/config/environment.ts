interface EnvironmentConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  oauthRedirectUrl: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  
  // 개발 환경에서도 배포된 백엔드 사용 (테스트용)
  const useDeployedBackend = import.meta.env.VITE_USE_DEPLOYED_BACKEND === 'true';
  
  if (isDevelopment && !useDeployedBackend) {
    return {
      apiBaseUrl: 'http://localhost:8080/api',
      wsBaseUrl: 'http://localhost:8080',
      oauthRedirectUrl: 'http://localhost:8080/oauth2/authorization/kakao'
    };
  } else {
    return {
      apiBaseUrl: 'https://api.promisenow.store/api',
      wsBaseUrl: 'https://api.promisenow.store',
      oauthRedirectUrl: 'https://api.promisenow.store/oauth2/authorization/kakao'
    };
  }
};

export const config = getEnvironmentConfig();
