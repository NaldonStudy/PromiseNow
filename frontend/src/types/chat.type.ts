// src/types/chat.type.ts

export interface ChatMessage {
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PINO';
  imageUrl?: string;
  userId: number;
  nickname: string;
  sentDate: string;
}

export interface ChatMessageRequest {
  roomUserId: number;
  roomId: number;
  userId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'PINO';
  imageUrl: string | null;
  sendDate: string;
  lat?: number;
  lng?: number;
  timestamp?: string;
}
