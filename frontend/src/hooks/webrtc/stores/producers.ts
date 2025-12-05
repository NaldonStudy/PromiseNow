import { create } from 'zustand';

export interface Producer {
  id: string;
  track: MediaStreamTrack;
  paused: boolean;
}

interface ProducersState {
  producers: Record<string, Producer>;

  addProducer: (producer: Producer) => void;
  removeProducer: (producerId: string) => void;
  setProducerPaused: (producerId: string) => void;
  setProducerResumed: (producerId: string) => void;
  setProducerTrack: (producerId: string, track: MediaStreamTrack) => void;
  resetProducers: () => void;
}

export const useProducersStore = create<ProducersState>((set) => ({
  producers: {},

  addProducer: (producer) =>
    set((state) => ({
      producers: { ...state.producers, [producer.id]: producer },
    })),

  removeProducer: (producerId) =>
    set((state) => {
      const newProducers = { ...state.producers };
      delete newProducers[producerId];
      return { producers: newProducers };
    }),

  setProducerPaused: (producerId) =>
    set((state) => {
      const producer = state.producers[producerId];
      if (!producer) return state;
      return {
        producers: {
          ...state.producers,
          [producerId]: { ...producer, paused: true },
        },
      };
    }),

  setProducerResumed: (producerId) =>
    set((state) => {
      const producer = state.producers[producerId];
      if (!producer) return state;
      return {
        producers: {
          ...state.producers,
          [producerId]: { ...producer, paused: false },
        },
      };
    }),

  setProducerTrack: (producerId, track) =>
    set((state) => {
      const producer = state.producers[producerId];
      if (!producer) return state;
      return {
        producers: {
          ...state.producers,
          [producerId]: { ...producer, track },
        },
      };
    }),

  resetProducers: () => ({ producers: {} }),
}));
