// 날짜별 가능한 시간대
export interface AvailabilityData {
  date: string;
  timeData: string;
}

// 특정 시간대가 가능한 사용자
export interface ConfirmedUserData {
  nickname: string;
  profileImage: string;
}

// 추천 시간대
export interface RecommendTime {
  date: string;
  timeStart: string;
  timeEnd: string;
  count: number;
}

// Request 타입들
export interface UpdateAvailabilityRequest {
  roomUserId: number;
  updatedDataList: AvailabilityData[];
}

export interface UpdateOneAvailabilityRequest {
  roomUserId: number;
  date: string;
  timeData: string;
}

export interface GetTotalAvailabilityRequest {
  roomId: number;
}

export interface GetMyAvailabilityRequest {
  roomUserId: number;
}

export interface GetConfirmedUsersRequest {
  roomId: number;
  date: string;
  slot: number;
}

// Response 타입들
export interface TotalAvailabilityResponse {
  totalDatas: AvailabilityData[];
}

export interface MyAvailabilityResponse {
  availabilities: AvailabilityData[];
}

export interface ConfirmedUsersResponse {
  confirmedUserList: ConfirmedUserData[];
}

export interface RecommendTimeResponse {
  times: RecommendTime[];
}
