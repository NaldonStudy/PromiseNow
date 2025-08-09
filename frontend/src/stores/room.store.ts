import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomStore {
  currentRoomId: number | null;
  dateRange: { start: Date; end: Date };
  nickname: string | null;
  profileImageUrl: string | null;

  setCurrentRoomId: (roomId: number | null) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setNickname: (nickname: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => {
      const today = new Date();
      return {
        currentRoomId: null,
        dateRange: { start: today, end: today },
        nickname: null,
        profileImageUrl: null,

        setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
        setDateRange: (range) => set({ dateRange: range }),
        setNickname: (nickname) => set({ nickname }),
        setProfileImageUrl: (url) => set({ profileImageUrl: url }),
      };
    },
    {
      name: 'room-store',
      partialize: (state) => ({
        currentRoomId: state.currentRoomId,
        nickname: state.nickname,
        dateRange: state.dateRange,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as RoomStore;

        const toValidDate = (value: unknown) => {
          const date = new Date(value as string);
          return isNaN(date.getTime()) ? new Date() : date;
        };

        return {
          ...currentState,
          ...state,
          dateRange: state.dateRange
            ? {
                start: toValidDate(state.dateRange.start),
                end: toValidDate(state.dateRange.end),
              }
            : {
                start: new Date(),
                end: new Date(),
              },
        };
      },
    },
  ),
);
