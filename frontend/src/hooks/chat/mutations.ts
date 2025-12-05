import { useMutation } from '@tanstack/react-query';
import { uploadChatImage } from '../../apis/chat/chat.api';
import type { UploadImageResponse, UploadImageRequest } from '../../apis/chat/chat.types';
// 이미지 업로드 훅
// export const useUploadChatImage = () => {
//   return useMutation({
//     mutationFn: uploadChatImage,
//   });
// };
export const useUploadChatImage = () =>
  useMutation<UploadImageResponse, Error, UploadImageRequest>({ mutationFn: uploadChatImage });
