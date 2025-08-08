import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type { UploadImageRequest, ChatMessageResponse, UploadImageResponse} from './chat.types';

// 채팅 메시지 조회
// src/apis/chat/chat.api.ts
export const getChatMessages = async (roomId: number) => {
  const data = await handleApi<ChatMessageResponse[]>(
    axiosInstance.get(`/chatting/${roomId}/messages`)
  );
  return data ?? []; // ← 반드시 배열로 보장
};

// 채팅방 이미지 업로드
export const uploadChatImage = async (request: UploadImageRequest) => {
  const formData = new FormData();
  formData.append('file', request.file);

  const res = await handleApi<UploadImageResponse>(
    axiosInstance.post(`/api/chatting/upload/image`, formData, {
      params: { lat: request.latitude, lng: request.longitude, sendDate: request.sendDate },
    })
  );
  return res;

}