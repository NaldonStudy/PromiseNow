import { create } from 'zustand';

export const useCallActionStore = create<{
  requestJoin: boolean;
  triggerJoin: () => void;
  requestLeave: boolean;
  triggerLeave: () => void;
  reset: () => void;
}>((set) => ({
  requestJoin: false,
  triggerJoin: () => set({ requestJoin: true }),
  requestLeave: false,
  triggerLeave: () => set({ requestLeave: true }),
  reset: () => set({ requestJoin: false, requestLeave: false }),
}));
