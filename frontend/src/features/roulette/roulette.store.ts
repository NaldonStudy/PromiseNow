import { create } from 'zustand';
import { type RouletteOption } from './roulette.types';

interface RouletteState {
  options: RouletteOption[];
  mustStartSpinning: boolean;
  prizeNumber: number;
  setOptions: (options: RouletteOption[]) => void;
  addOption: (option: string) => void;
  removeOption: (index: number) => void;
  startSpinning: () => void;
  stopSpinning: (prizeNumber: number) => void;
}

export const useRouletteStore = create<RouletteState>((set, get) => ({
  options: [],
  mustStartSpinning: false,
  prizeNumber: 0,

  setOptions: (options) => set({ options }),

  addOption: (option) => {
    const { options } = get();
    const colorIndex = options.length % 3;

    let backgroundColor: string;
    let textColor: string;

    switch (colorIndex) {
      case 0:
        backgroundColor = '#fdf2eb';
        textColor = '#bb4f15';
        break;
      case 1:
        backgroundColor = '#f28145';
        textColor = 'white';
        break;
      case 2:
        backgroundColor = '#bb4f15';
        textColor = 'white';
        break;
      default:
        backgroundColor = '#fdf2eb';
        textColor = '#bb4f15';
    }

    const newOption: RouletteOption = {
      option,
      style: {
        backgroundColor,
        textColor,
      },
    };

    set((state) => ({
      options: [...state.options, newOption],
    }));
  },

  removeOption: (index) => {
    const { mustStartSpinning } = get();
    if (mustStartSpinning) {
      return;
    }
    set((state) => ({
      options: state.options.filter((_, i) => i !== index),
    }));
  },

  startSpinning: () => {
    const { options } = get();
    if (options.length === 0) {
      return;
    }
    const randomPrize = Math.floor(Math.random() * options.length);
    set({
      mustStartSpinning: true,
      prizeNumber: randomPrize,
    });
  },

  stopSpinning: (prizeNumber) =>
    set({
      mustStartSpinning: false,
      prizeNumber,
    }),
}));
