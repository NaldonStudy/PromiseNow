// src/apis/chat/chat.types.ts

export interface MessageResponseDto {
  content: string;
  userId: number;
  nickname: string;
  sentDate: string;
  type: 'TEXT' | 'IMAGE';
  imageUrl?: string;
}
