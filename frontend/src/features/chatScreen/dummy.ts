import type { ChatMessageResponse } from '../../apis/chat/chat.types';

export const dummyMessages: ChatMessageResponse[] = [
  // 🟢 같은 사람, 같은 시간, 여러 메시지
  {
    content: '안녕하세요!',
    roomUserId: 1,
    nickname: '지현',
    sentDate: '2025-08-05T08:00:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },
  {
    content: '오늘 약속 잘 지켜야 해요.',
    roomUserId: 1,
    nickname: '지현',
    sentDate: '2025-08-05T08:00:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },

  // 🟢 같은 사람, 시간 다름
  {
    content: '아까 말한 카페 어때요?',
    roomUserId: 1,
    nickname: '지현',
    sentDate: '2025-08-05T08:03:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },

  // 🔵 다른 사람, 같은 시간
  {
    content: '좋아요. 그 근처에 주차장이 있나요?',
    roomUserId: 2,
    nickname: 'gpt',
    sentDate: '2025-08-05T08:03:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },

  // 🔵 다른 사람, 다른 시간, 이미지
  {
    content: '여기 사진 참고해주세요!',
    roomUserId: 2,
    nickname: 'gpt',
    sentDate: '2025-08-05T08:05:00.000Z',
    type: 'IMAGE',
    imageUrl: 'http://localhost:8080/uploaded-images/test-image.png',
  },

  // 🟢 다시 지현, 시간 다름
  {
    content: '와 사진 좋네요!',
    roomUserId: 1,
    nickname: '지현',
    sentDate: '2025-08-05T08:06:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },

  // 🔵 gpt, 같은 시간에 2개
  {
    content: '그럼 10시에 만나요!',
    roomUserId: 2,
    nickname: 'gpt',
    sentDate: '2025-08-05T08:10:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },
  {
    content: '늦지 마세요~',
    roomUserId: 2,
    nickname: 'gpt',
    sentDate: '2025-08-05T08:10:00.000Z',
    type: 'TEXT',
    imageUrl: null,
  },
];
