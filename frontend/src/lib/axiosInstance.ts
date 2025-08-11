import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.promisenow.store/api/',
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type']; // axios가 boundary 자동 추가
    }
  }
  return config;
});
export default axiosInstance;
