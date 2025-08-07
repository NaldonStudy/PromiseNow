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
        case 404:
          console.error('404:', message);
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
