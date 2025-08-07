import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomStore {
  currentRoomId: number | null;
  dateRange: { start: Date; end: Date } | null;
  nickname: string | null;
  profileImageUrl: string | null;

  setCurrentRoomId: (roomId: number | null) => void;
  setDateRange: (range: { start: Date; end: Date } | null) => void;
  setNickname: (nickname: string | null) => void;
  setProfileImageUrl: (url: string | null) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      currentRoomId: null,
      dateRange: null,
      nickname: null,
      profileImageUrl: null,

      setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
      setDateRange: (range) => set({ dateRange: range }),
      setNickname: (nickname) => set({ nickname }),
      setProfileImageUrl: (url) => set({ profileImageUrl: url }),
    }),
    {
      name: 'room-store',
      partialize: (state) => ({ currentRoomId: state.currentRoomId, nickname: state.nickname }),
    },
  ),
);
