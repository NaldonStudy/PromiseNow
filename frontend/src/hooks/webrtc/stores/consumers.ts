import { create } from 'zustand';

export interface Consumer {
  id: string;
  peerId: string;
  kind: 'audio' | 'video';
  track: MediaStreamTrack;
}

interface ConsumersState {
  consumers: Record<string, Consumer>;

  addConsumer: (consumer: Consumer) => void;
  removeConsumer: (consumerId: string) => void;
  setConsumerTrack: (consumerId: string, track: MediaStreamTrack) => void;
  resetConsumers: () => void;
}

export const useConsumersStore = create<ConsumersState>((set) => ({
  consumers: {},

  addConsumer: (consumer) =>
    set((state) => ({
      consumers: { ...state.consumers, [consumer.id]: consumer },
    })),

  removeConsumer: (consumerId) =>
    set((state) => {
      const newConsumers = { ...state.consumers };
      delete newConsumers[consumerId];
      return { consumers: newConsumers };
    }),

  setConsumerTrack: (consumerId, track) =>
    set((state) => {
      const consumer = state.consumers[consumerId];
      if (!consumer) return state;
      return {
        consumers: {
          ...state.consumers,
          [consumerId]: { ...consumer, track },
        },
      };
    }),

  resetConsumers: () => ({ consumers: {} }),
}));
