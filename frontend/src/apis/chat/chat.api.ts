import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type { ChatMessage } from './chat.type';

// 채팅 메시지 조회
export const getChatMessages = async (roomId: number) => {
  const data = await handleApi<ChatMessage[]>(axiosInstance.get(`/chatting/${roomId}/messages`));
  return data;
};
