import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomStore {
  currentRoomId: number | null;
  nickname: string | null;
  profileImageUrl: string | null;

  setCurrentRoomId: (roomId: number | null) => void;
  setNickname: (nickname: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => {
      return {
        currentRoomId: null,
        nickname: null,
        profileImageUrl: null,

        setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
        setNickname: (nickname) => set({ nickname }),
        setProfileImageUrl: (url) => set({ profileImageUrl: url }),
      };
    },
    {
      name: 'room-store',
      partialize: (state) => ({
        currentRoomId: state.currentRoomId,
        nickname: state.nickname,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as RoomStore;

        return {
          ...currentState,
          ...state,
        };
      },
    },
  ),
);
