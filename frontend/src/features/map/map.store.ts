import { create } from 'zustand';

interface MapStore {
  rankingHeight: number;
  setRankingHeight: (height: number) => void;
  moveToCurrentLocation: (() => void) | null;
  setMoveToCurrentLocation: (fn: (() => void) | null) => void;
}

const useMapStore = create<MapStore>((set) => ({
  rankingHeight: window.innerHeight * 0.4,
  setRankingHeight: (height: number) => set({ rankingHeight: height }),
  moveToCurrentLocation: null,
  setMoveToCurrentLocation: (fn: (() => void) | null) => set({ moveToCurrentLocation: fn }),
}));

export default useMapStore;
