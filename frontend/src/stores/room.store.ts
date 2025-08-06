import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoomStore {
  currentRoomId: number | null;
  dateRange: { start: Date; end: Date } | null;

  setCurrentRoomId: (roomId: number | null) => void;
  setDateRange: (range: { start: Date; end: Date } | null) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      currentRoomId: null,
      dateRange: null,

      setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
      setDateRange: (range) => set({ dateRange: range }),
    }),
    {
      name: 'room-store',
      partialize: (state) => ({ currentRoomId: state.currentRoomId }),
    },
  ),
);
