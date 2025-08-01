import { create } from 'zustand';

interface MapStore {
  rankingHeight: number;
  setRankingHeight: (height: number) => void;
}

const useMapStore = create<MapStore>((set) => ({
  rankingHeight: window.innerHeight * 0.4,
  setRankingHeight: (height: number) => set({ rankingHeight: height }),
}));

export default useMapStore;
