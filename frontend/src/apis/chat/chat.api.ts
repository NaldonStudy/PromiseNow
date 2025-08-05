// src/apis/chat/chat.api.ts
import axios from 'axios';
import type { MessageResponseDto } from './chat.types';

export const getChatMessages = async (roomId: number): Promise<MessageResponseDto[]> => {
  const response = await axios.get<MessageResponseDto[]>(
    `http://localhost:8080/api/chatting/${roomId}/messages`
  );
  return response.data;
};
