// src/hooks/queries/chat/keys.ts
import { useQueryClient } from '@tanstack/react-query';

export const chatKeys = {
  all: ['chat'] as const,
  messages: (roomId: number) => [...chatKeys.all, roomId, 'messages'] as const,
};

export const useInvalidateChatQueries = () => {
  const queryClient = useQueryClient();

  const invalidateMessages = (roomId: number) => {
    queryClient.invalidateQueries({ queryKey: chatKeys.messages(roomId) });
  };

  return { invalidateMessages };
};