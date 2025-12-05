export interface Participant {
  name: string;
  profileImg: string | null;
}

export const dummyParticipants: Participant[] = [
  {
    name: '홍길동',
    profileImg: null,
  },
  {
    name: '김영희',
    profileImg: 'https://example.com/img.jpg',
  },
  {
    name: '이철수',
    profileImg: null,
  },
];
