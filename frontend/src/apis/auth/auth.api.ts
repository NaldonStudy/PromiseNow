import axiosInstance from '../../lib/axiosInstance';

export const logout = async () => {
  const data = await axiosInstance.get('/auth/logout');
  return data;
};
