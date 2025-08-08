import { create } from 'zustand';

export type RoomStateType = 'new' | 'connecting' | 'connected' | 'disconnected' | 'closed';
// new: 초기 | connecting: 접속 시도 중 | connected: 정상 연결 | disconnected: 일시적 연결 끊김 | closed: 종료

export interface RoomStoreState {
  state: RoomStateType;
  activeSpeakerId: string | null;

  setRoomState: (roomState: RoomStateType) => void;
  setActiveSpeakerId: (peerId: string | null) => void;
  resetActiveSpeakerIfPeerRemoved: (peerId: string) => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  state: 'new',
  activeSpeakerId: null,

  setRoomState: (roomState) =>
    set(() => ({
      state: roomState,
    })),

  setActiveSpeakerId: (peerId) => set({ activeSpeakerId: peerId }),

  resetActiveSpeakerIfPeerRemoved: (peerId) =>
    set((state) => ({
      activeSpeakerId: state.activeSpeakerId === peerId ? null : state.activeSpeakerId,
    })),
}));
