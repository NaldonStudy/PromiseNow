// src/hooks/chat/useChatPublish.ts
import { useCallback, useMemo } from 'react';
import { useUserStore } from '../../stores/user.store';
import { useUploadChatImage } from '../chat';
import { useRoomUserInfo } from '../queries/room';
import { useChatSocket } from '../socket/useChatSocket';

export const useChatPublish = (roomId: number) => {
  const { user } = useUserStore();
  const userId = user?.userId

  const roomUserId = useRoomUserInfo(roomId, userId!).data?.roomUserId;

  const wsBase = useMemo(() => 'https://api.promisenow.store/ws-chat', []);
  const subscribeDest = useCallback((rid: number) => `/topic/chat/${rid}`, []);
  const { isConnected, sendMessage } = useChatSocket(roomId, () => {}, { wsBase, subscribeDest });

  const { mutateAsync: uploadImage } = useUploadChatImage();

  const canSend = roomId != null && roomUserId != null && userId != null && isConnected;

  const sendText = useCallback(
    (content: string) => {
      if (!canSend || !content.trim()) return;
      const sentDate = new Date().toISOString();
      sendMessage({
        roomId,
        roomUserId,
        userId,
        type: 'TEXT',
        content: content.trim(),
        imageUrl: null,
        lat: null,
        lng: null,
        sentDate,
      });
    },
    [canSend, roomId, roomUserId, sendMessage, userId],
  );

  const sendImage = useCallback(
    async (file: File) => {
      if (!canSend) throw new Error('context not ready');

      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
        }),
      );

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const sentDate = new Date().toISOString();

      const result = await uploadImage({ file, lat: latitude, lng: longitude, sentDate });
      if (!result?.fileUrl) throw new Error('invalid upload result');

      sendMessage({
        roomId,
        roomUserId,
        userId,
        type: 'IMAGE',
        content: '이미지',
        imageUrl: result.fileUrl,
        lat: latitude,
        lng: longitude,
        sentDate,
      });
    },
    [canSend, roomId, roomUserId, sendMessage, uploadImage, userId],
  );

  return { isConnected, canSend, sendText, sendImage };
};
