import axios, { type AxiosResponse } from 'axios';
import type { ApiResponse } from '../types/api.type';

const handleApi = async <T>(apiCall: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T | null> => {
  try {
    // 상태코드 200
    const response = await apiCall;
    return response.data.data;
  } catch (error) {
    // 오류 발생
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          console.error('400:', message);
          break;
        case 401:
          console.error('401: 인증 실패 - 토큰 재발급 시도 중...');
          // 401 에러는 axiosInstance의 인터셉터에서 처리됨
          break;
        case 404:
          console.error('404:', message);
          break;
        case 403:
          console.error('403: 권한 없음');
          break;
        case 500:
          console.error('500: 서버 오류');
          break;
        default:
          console.error(`${status}:`, message);
      }
    } else {
      console.error('예기치 못한 오류:', error);
    }
    return null;
  }
};

export default handleApi;
