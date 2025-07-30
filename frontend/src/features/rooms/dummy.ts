export interface RoomResponse {
  roomId: number;
  roomTitle: string;
  locationDate: string | null;
  locationName: string | null;
  locationTime: string | null;
  participantSummary: string;
}

export const dummy: RoomResponse[] = [
  {
    roomId: 1,
    roomTitle: '0728test1',
    locationDate: '2025-07-28T07:46:15.072',
    locationTime: null,
    locationName: '삼성화재 유성',
    participantSummary: 'first 외 2명',
  },
  {
    roomId: 2,
    roomTitle: '팀 프로젝트 킥오프',
    locationDate: '2025-08-01T14:00:00.000',
    locationTime: '17:00',
    locationName: '카페 블루보틀 역삼',
    participantSummary: '지현 외 3명',
  },
  {
    roomId: 3,
    roomTitle: '동창회 모임',
    locationDate: '2025-07-03',
    locationTime: '08:00',
    locationName: '강남 교대역 근처',
    participantSummary: '민수 외 4명',
  },
  {
    roomId: 4,
    roomTitle: '산책 약속',
    locationDate: '2025-08-05T07:30:00.000',
    locationTime: null,
    locationName: null,
    participantSummary: '영희 외 1명',
  },
];
