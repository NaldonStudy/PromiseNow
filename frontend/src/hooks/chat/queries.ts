import { useQuery } from '@tanstack/react-query';
import { getChatMessages } from '../../apis/chat/chat.api';
import { chatKeys } from './keys';

// 메세지 조회 
export const useChatMessages = (roomId: number) =>
  useQuery({
    queryKey: chatKeys.messages(roomId),
    queryFn: () => getChatMessages(roomId),
    enabled: !isNaN(roomId),
    staleTime: 30_000,
  });