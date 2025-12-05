// axios와 동일한 base URL 패턴 사용
const getWebSocketBaseUrl = () => {
  // 개발 환경에서는 localhost, 프로덕션에서는 실제 도메인 사용
  if (import.meta.env.DEV) {
    return 'ws://localhost:8080';
  }
  return 'wss://api.promisenow.store';
};

const createWebSocketConnection = (endpoint: string) => {
  const baseUrl = getWebSocketBaseUrl();
  return new WebSocket(`${baseUrl}${endpoint}`);
};

export default createWebSocketConnection; 