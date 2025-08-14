import { create } from 'zustand';

export const useCallActionStore = create<{
  requestLeave: boolean;
  triggerLeave: () => void;
  reset: () => void;
}>((set) => ({
  requestLeave: false,
  triggerLeave: () => set({ requestLeave: true }),
  reset: () => set({ requestLeave: false }),
}));
