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

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

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
        // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
        console.error('토큰 재발급 실패:', refreshError);
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
