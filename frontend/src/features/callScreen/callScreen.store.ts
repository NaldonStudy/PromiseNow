import { create } from 'zustand';

interface CallScreenState {
  viewMode: 'grid' | 'spotlight';
  selectedParticipantId: string | null;
  setViewMode: (mode: 'grid' | 'spotlight') => void;
  setSelectedParticipant: (participantId: string | null) => void;
  toggleViewMode: () => void;
}

export const useCallScreenStore = create<CallScreenState>((set, get) => ({
  viewMode: 'grid',
  selectedParticipantId: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedParticipant: (participantId) =>
    set({
      selectedParticipantId: participantId,
      viewMode: participantId ? 'spotlight' : 'grid',
    }),
  toggleViewMode: () => {
    const { viewMode } = get();
    if (viewMode === 'spotlight') {
      set({ viewMode: 'grid', selectedParticipantId: null });
    } else {
      set({ viewMode: 'grid' });
    }
  },
}));
