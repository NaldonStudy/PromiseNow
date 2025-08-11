// features/roulette/roulette.store.ts
import { create } from 'zustand';

interface SpinState {
  mustStartSpinning: boolean;
  prizeNumber: number;
  startSpinning: (itemCount: number) => void;
  stopSpinning: (prizeNumber: number) => void;
}

export const useRouletteSpinStore = create<SpinState>((set) => ({
  mustStartSpinning: false,
  prizeNumber: 0,

  startSpinning: (itemCount: number) => {
    if (itemCount <= 0) return;
    const random = Math.floor(Math.random() * itemCount);
    set({ mustStartSpinning: true, prizeNumber: random });
  },

  stopSpinning: (prizeNumber) => set({ mustStartSpinning: false, prizeNumber }),
}));
