import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';

export interface User {
  userId: number;
  email: string;
  username: string;
  joinDate: string;
  password: string | null;
}

export interface UserBasicInfo {
  userId: number;
  email: string;
  nickname: string;
  joinDate: string;
}

// 내 정보 조회
export const getMyInfo = async (): Promise<User | null> => {
  const data = await handleApi<User>(axiosInstance.get('/users/me'));
  return data;
};

// 개발용: 강제로 토큰을 헤더에 추가하여 사용자 정보 조회
export const getMyInfoWithToken = async (token: string): Promise<User | null> => {
  try {
    const response = await axiosInstance.get('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `access_token=${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('토큰으로 사용자 정보 조회 실패:', error);
    return null;
  }
};

// 내 기본 정보 조회
export const getMyBasicInfo = async (): Promise<UserBasicInfo | null> => {
  const data = await handleApi<UserBasicInfo>(axiosInstance.get('/users/me/basic'));
  return data;
};

// 랜덤 닉네임 생성 테스트
export const generateTestNickname = async (): Promise<{ nickname: string; message: string } | null> => {
  const data = await handleApi<{ nickname: string; message: string }>(axiosInstance.get('/users/test/nickname'));
  return data;
};
