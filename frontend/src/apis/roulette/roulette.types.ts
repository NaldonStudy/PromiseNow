// 룰렛 회전 옵션
export interface RouletteOption {
  option: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

// ------ Request 타입들 ------


// 룰렛 생성
export interface RouletteCreateRequest {
  roomId: number;
  roomUserId: number;
  content: string;
}

// 룰렛 수정
export interface RouletteUpdateRequest {
  roomId: number;
  roomUserId: number;
  content: string;
}

// 룰렛 삭제
export interface RouletteDeleteRequest {
  roomId: number;
  roomUserId: number;
}

// ------ Response 타입들 -----

// 전체 룰렛 조회
export interface RouletteResponse {
  rouletteId: number;
  roomId: number;
  roomUserId: number;
  content: string;
}
