import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomStore {
  nickname: string | null;
  profileImageUrl: string | null;

  setNickname: (nickname: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => {
      return {
        nickname: null,
        profileImageUrl: null,

        setNickname: (nickname) => set({ nickname }),
        setProfileImageUrl: (url) => set({ profileImageUrl: url }),
      };
    },
    {
      name: 'room-store',
      partialize: (state) => ({
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
