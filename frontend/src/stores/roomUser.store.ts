import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RoomUserMap = Record<number, number>;

interface RoomUserStore {
  roomusers: RoomUserMap;
  setRoomUser: (roomId: number, roomUserId: number) => void;
  getRoomUserId: (roomId: number) => number | undefined;
  clearRoomUser: (roomId: number) => void;
  clearAll: () => void;
}

export const useRoomUserStore = create<RoomUserStore>()(
  persist(
    (set, get) => ({
      roomusers: {},
      setRoomUser: (roomId, roomUserId) =>
        set((s) => ({ roomusers: { ...s.roomusers, [roomId]: roomUserId } })),
      getRoomUserId: (roomId) => get().roomusers[roomId],
      clearRoomUser: (roomId) =>
        set((s) => {
          const n = { ...s.roomusers };
          delete n[roomId];
          return { roomusers: n };
        }),
      clearAll: () => set({ roomusers: {} }),
    }),
    { name: 'roomuser-store' },
  ),
);
