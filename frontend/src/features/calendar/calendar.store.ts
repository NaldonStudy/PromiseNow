import { format } from 'date-fns';
import { create } from 'zustand';

interface CalendarStore {
  view: 'week' | 'month';
  mode: 'view' | 'edit';
  currentDate: Date;
  startDate: Date | null;
  endDate: Date | null;

  setView: (v: 'week' | 'month') => void;
  setMode: (m: 'view' | 'edit') => void;

  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;

  setCurrentDate: (date: Date) => void;
  moveWeek: (d: -1 | 1) => void;
  moveMonth: (d: -1 | 1) => void;

  userSelections: Record<string, boolean[]>;
  setUserSelections: (
    update: (prev: Record<string, boolean[]>) => Record<string, boolean[]>,
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

  setStartDate: (date) => {
    set((state) => {
      const newSelections = { ...state.userSelections };
      if (state.endDate) {
        const start = date;
        const end = state.endDate;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = format(new Date(d), 'yyyy-MM-dd');
          if (!newSelections[key]) {
            newSelections[key] = Array(30).fill(false);
          }
        }
      }
      return { startDate: date, userSelections: newSelections };
    });
  },
  setEndDate: (date) => {
    set((state) => {
      const newSelections = { ...state.userSelections };
      if (state.startDate) {
        const start = state.startDate;
        const end = date;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = format(new Date(d), 'yyyy-MM-dd');
          if (!newSelections[key]) {
            newSelections[key] = Array(30).fill(false);
          }
        }
      }
      return { endDate: date, userSelections: newSelections };
    });
  },

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
  setUserSelections: (update) => set((state) => ({ userSelections: update(state.userSelections) })),
}));
