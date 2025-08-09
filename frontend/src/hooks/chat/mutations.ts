import { useMutation } from '@tanstack/react-query';
import { uploadChatImage } from '../../apis/chat/chat.api';

// 이미지 업로드 훅
export const useUploadChatImage = () => {
  return useMutation({
    mutationFn: uploadChatImage,
  });
};