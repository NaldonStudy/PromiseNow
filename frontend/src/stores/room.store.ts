import { create } from 'zustand';

interface RoomStore {
  profileImageUrl: string | null;

  setProfileImageUrl: (url: string | null) => void;
}

export const useRoomStore = create<RoomStore>()((set) => {
  return {
    profileImageUrl: null,
    setProfileImageUrl: (url) => set({ profileImageUrl: url }),
  };
});
