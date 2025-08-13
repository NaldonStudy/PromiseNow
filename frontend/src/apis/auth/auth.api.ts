import axiosInstance from '../../lib/axiosInstance';

export const logout = async () => {
  const data = await axiosInstance.post('/auth/logout');
  return data;
};
