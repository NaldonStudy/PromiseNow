/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

export interface MeState {
  id: string | null;
  displayName: string | null;
  device: any;
  canSendMic: boolean;
  canSendWebcam: boolean;
  audioMuted: boolean;
  videoMuted: boolean;

  setMe: (payload: { peerId: string; displayName: string; device: any }) => void;
  setMediaCapabilities: (payload: { canSendMic: boolean; canSendWebcam: boolean }) => void;
  setDisplayName: (displayName: string) => void;
  setAudioMutedState: (enabled: boolean) => void;
  setVideoMutedState: (enabled: boolean) => void;
  resetOnRoomClosed: () => void;
}

export const useMeStore = create<MeState>((set) => ({
  id: null,
  displayName: null,
  device: null,
  canSendMic: false,
  canSendWebcam: false,
  audioMuted: false,
  videoMuted: false,

  setMe: ({ peerId, displayName, device }) => set({ id: peerId, displayName, device }),

  setMediaCapabilities: ({ canSendMic, canSendWebcam }) => set({ canSendMic, canSendWebcam }),

  setDisplayName: (displayName) =>
    set((state) => ({
      displayName: displayName || state.displayName,
    })),

  setAudioMutedState: (enabled) => set({ audioMuted: enabled }),
  setVideoMutedState: (enabled) => set({ videoMuted: enabled }),

  resetOnRoomClosed: () => set({ audioMuted: false, videoMuted: false }),
}));
