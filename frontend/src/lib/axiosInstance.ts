import axios from 'axios';
import { config } from '../config/environment';

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl + '/',
  withCredentials: true,
  timeout: 10000,
});

// 응답 인터셉터 - 401 에러 처리 및 토큰 재발급
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 네트워크 에러 또는 CORS 에러 시 즉시 홈으로 리다이렉트
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
      return Promise.reject(error);
    }

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 특정 API는 재시도하지 않음 (무한 루프 방지)
      if (error.config?.url?.includes('/auth/refresh') || error.config?.url?.includes('/auth/logout')) {
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // 토큰 재발급 요청
        const refreshResponse = await axios.post(
          config.apiBaseUrl + '/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200) {
          // 토큰 재발급 성공 시 원래 요청 재시도
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 재발급 실패 시 홈으로 리다이렉트
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
