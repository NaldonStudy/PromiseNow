import { create } from 'zustand';

export interface Peer {
  id: string;
  displayName: string;
  consumers: string[];
}

interface PeersState {
  peers: Record<string, Peer>;

  addPeer: (peer: Peer) => void;
  removePeer: (peerId: string) => void;
  setPeerDisplayName: (peerId: string, displayName: string) => void;
  addConsumerToPeer: (peerId: string, consumerId: string) => void;
  removeConsumerFromPeer: (peerId: string, consumerId: string) => void;
  resetPeers: () => void;
}

export const usePeersStore = create<PeersState>((set) => ({
  peers: {},

  addPeer: (peer) =>
    set((state) => ({
      peers: { ...state.peers, [peer.id]: { ...peer, consumers: peer.consumers || [] } },
    })),

  removePeer: (peerId) =>
    set((state) => {
      const newPeers = { ...state.peers };
      delete newPeers[peerId];
      return { peers: newPeers };
    }),

  setPeerDisplayName: (peerId, displayName) =>
    set((state) => {
      const peer = state.peers[peerId];
      if (!peer) return state;
      return {
        peers: {
          ...state.peers,
          [peerId]: { ...peer, displayName },
        },
      };
    }),

  addConsumerToPeer: (peerId, consumerId) =>
    set((state) => {
      const peer = state.peers[peerId];
      if (!peer || peer.consumers.includes(consumerId)) return state;
      return {
        peers: {
          ...state.peers,
          [peerId]: { ...peer, consumers: [...peer.consumers, consumerId] },
        },
      };
    }),

  removeConsumerFromPeer: (peerId, consumerId) =>
    set((state) => {
      const peer = state.peers[peerId];
      if (!peer) return state;
      return {
        peers: {
          ...state.peers,
          [peerId]: { ...peer, consumers: peer.consumers.filter((id) => id !== consumerId) },
        },
      };
    }),

  resetPeers: () => ({ peers: {} }),
}));
