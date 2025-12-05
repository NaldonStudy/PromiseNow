import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type { ApiResponse } from '../../types/api.type';
import type { ChatMessageResponse, UploadImageRequest, UploadImageResponse } from './chat.types';
// src/apis/chat/chat.api.ts

// 채팅 메시지 조회
export const getChatMessages = async (roomId: number) => {
  const data = await handleApi<ChatMessageResponse[]>(
    axiosInstance.get(`/chatting/${roomId}/messages`),
  );
  return data ?? []; // ← 반드시 배열로 보장
};

// 채팅방 이미지 업로드
export const uploadChatImage = async (request: UploadImageRequest) => {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('lat', String(request.lat));
  formData.append('lng', String(request.lng));
  formData.append('sentDate', request.sentDate);

  const data = await handleApi<UploadImageResponse>(
    axiosInstance.post<ApiResponse<UploadImageResponse>>('/chatting/upload/image', formData),
  );
  if (!data) throw new Error('업로드 실패');
  return data;
};
