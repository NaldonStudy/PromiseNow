import { create } from 'zustand';

interface CalendarStore {
  view: 'week' | 'month';
  mode: 'view' | 'edit';
  currentDate: Date;

  setView: (v: 'week' | 'month') => void;
  setMode: (m: 'view' | 'edit') => void;

  setCurrentDate: (date: Date) => void;
  moveWeek: (d: -1 | 1) => void;
  moveMonth: (d: -1 | 1) => void;

  userSelections: Record<string, boolean[]>;
  setUserSelections: (
    update:
      | Record<string, boolean[]>
      | ((prev: Record<string, boolean[]>) => Record<string, boolean[]>),
  ) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  view: 'month',
  mode: 'view',
  currentDate: new Date(),
  startDate: null,
  endDate: null,

  setView: (v) => set({ view: v }),
  setMode: (m) => set({ mode: m }),

  setCurrentDate: (date) => set({ currentDate: date }),
  moveWeek: (d) =>
    set((state) => ({
      currentDate: new Date(state.currentDate.getTime() + d * 7 * 24 * 60 * 60 * 1000),
    })),
  moveMonth: (d) =>
    set((state) => ({
      currentDate: new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + d),
    })),

  userSelections: {},
  setUserSelections: (update) =>
    set((state) => ({
      userSelections: typeof update === 'function' ? update(state.userSelections) : update,
    })),
}));
