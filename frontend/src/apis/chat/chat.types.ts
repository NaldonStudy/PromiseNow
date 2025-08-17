// src/types/chat.types.ts
export type MessageType = 'TEXT' | 'IMAGE' | 'PINO';

// ------ Request 타입들 ------

// 채팅방 이미지 저장 요청
export interface UploadImageRequest {
  lat: number;
  lng: number;
  sentDate: string;
  file: File;
}

// ------ Response 타입들 -----

// 메세지 전체 조회
export interface ChatMessageResponse {
  content: string;
  roomUserId: number;
  nickname: string;
  sentDate: string; // 백엔드에서 문자열로 전송
  type: MessageType;
  imageUrl: string | null;
}

// 이미지 경로 받기
export interface UploadImageResponse {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}
