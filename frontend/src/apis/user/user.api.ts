import axiosInstance from '../../lib/axiosInstance';

export interface User {
  userId: number;
  email: string;
  username: string;
  joinDate: string;
}

export interface UserBasicInfo {
  userId: number;
  email: string;
  nickname: string;
  joinDate: string;
}

// 내 정보 조회
export const getMyInfo = async (): Promise<User> => {
  const response = await axiosInstance.get('/users/me');
  return response.data.data;
};

// 내 기본 정보 조회
export const getMyBasicInfo = async (): Promise<UserBasicInfo> => {
  const response = await axiosInstance.get('/users/me/basic');
  return response.data.data;
};

// 랜덤 닉네임 생성 테스트
export const generateTestNickname = async (): Promise<{ nickname: string; message: string }> => {
  const response = await axiosInstance.get('/users/test/nickname');
  return response.data.data;
};
