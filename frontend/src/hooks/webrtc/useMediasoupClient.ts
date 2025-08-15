/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import type { Device } from 'mediasoup-client';
import type { Transport, Producer, Consumer } from 'mediasoup-client/types';
import protooClient from 'protoo-client';

// =============================
// Types
// =============================

type UseClientOptions = {
  roomId: string;
  userId: string;
  displayName: string;
  produce: boolean;
  consume: boolean;
  mic: boolean;
  webcam: boolean;
  forceTcp?: boolean;
};

type Peer = {
  id: string;
  displayName: string;
  isSelf: boolean;
  joinedAt: number;
};

type State = {
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;

  // 피어/스트림
  peers: Map<string, Peer>;
  peerStreams: Map<string, MediaStream>;
  remoteStreams: Map<string, MediaStream>;

  // 로컬
  localStream: MediaStream | null;
  micProducer: Producer | null;
  webcamProducer: Producer | null;

  // 준비 상태
  isTransportReady: boolean;
};

const initialState: State = {
  isConnecting: false,
  isConnected: false,
  error: null,

  peers: new Map(),
  peerStreams: new Map(),
  remoteStreams: new Map(),

  localStream: null,
  micProducer: null,
  webcamProducer: null,

  isTransportReady: false,
};

// =============================
// Hook
// =============================
export function useMediasoupClient(opts: UseClientOptions) {
  const [state, setState] = useState<State>(initialState);

  // -------- Refs (mediasoup/protoo) --------
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);

  const protooRef = useRef<protooClient.Peer | null>(null);

  const selfPeerServerIdRef = useRef<string | null>(null);
  const selfUiIdRef = useRef<string>('local');

  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);

  const isJoiningRef = useRef(false);
  const hasJoinedRef = useRef(false);

  const stablePeerIdRef = useRef<string>('');

  const consumersRef = useRef<
    Map<string, { consumer: Consumer; peerId: string; kind: 'audio' | 'video' }>
  >(new Map());

  // 로컬 합본 스트림
  const localStreamRef = useRef<MediaStream | null>(null);

  // =============================
  // Helpers
  // =============================

  function getTabSessionId() {
    try {
      const KEY = 'webrtc.tabSessionId';
      let id = sessionStorage.getItem(KEY);
      if (!id) {
        id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
        sessionStorage.setItem(KEY, id);
      }
      return id;
    } catch {
      return Math.random().toString(36).slice(2);
    }
  }

  /** UI용 peerId로 변환 (로컬이면 'local') */
  const toUiPeerId = useCallback((peerId: string, isSelf: boolean) => {
    return isSelf ? selfUiIdRef.current : peerId;
  }, []);

  const rebuildRemoteStreamsFromPeerStreams = useCallback(
    (peerStreams: Map<string, MediaStream>) => {
      const remote = new Map<string, MediaStream>();
      for (const [pid, stream] of peerStreams) {
        if (pid !== selfUiIdRef.current) remote.set(pid, stream);
      }
      return remote;
    },
    [],
  );

  const upsertPeer = useCallback(
    (peer: Peer) => {
      setState((prev) => {
        const peers = new Map(prev.peers);
        peers.set(peer.id, peer);
        return {
          ...prev,
          peers,
          remoteStreams: rebuildRemoteStreamsFromPeerStreams(prev.peerStreams),
        };
      });
    },
    [rebuildRemoteStreamsFromPeerStreams],
  );

  const removePeer = useCallback(
    (peerServerId: string) => {
      setState((prev) => {
        const uiId = toUiPeerId(peerServerId, false);

        const peers = new Map(prev.peers);
        peers.delete(uiId);

        const peerStreams = new Map(prev.peerStreams);
        peerStreams.delete(uiId);

        const consumers = new Map(consumersRef.current);
        for (const [cid, entry] of consumers) {
          if (entry.peerId === peerServerId) {
            try {
              entry.consumer.close();
            } catch {}
            consumers.delete(cid);
          }
        }
        consumersRef.current = consumers;

        return {
          ...prev,
          peers,
          peerStreams,
          remoteStreams: rebuildRemoteStreamsFromPeerStreams(peerStreams),
        };
      });
    },
    [rebuildRemoteStreamsFromPeerStreams, toUiPeerId],
  );

  const upsertPeerTrack = useCallback(
    (uiPeerId: string, track: MediaStreamTrack) => {
      setState((prev) => {
        const peerStreams = new Map(prev.peerStreams);
        const stream = peerStreams.get(uiPeerId) ?? new MediaStream();

        stream.getTracks().forEach((t) => {
          if (t.kind === track.kind) stream.removeTrack(t);
        });
        stream.addTrack(track);
        peerStreams.set(uiPeerId, stream);

        return {
          ...prev,
          peerStreams,
          remoteStreams: rebuildRemoteStreamsFromPeerStreams(peerStreams),
        };
      });
    },
    [rebuildRemoteStreamsFromPeerStreams],
  );

  const removePeerTrack = useCallback(
    (uiPeerId: string, kind: 'audio' | 'video') => {
      setState((prev) => {
        const peerStreams = new Map(prev.peerStreams);
        const stream = peerStreams.get(uiPeerId);
        if (stream) {
          stream
            .getTracks()
            .filter((t) => t.kind === kind)
            .forEach((t) => {
              stream.removeTrack(t);
              try {
                t.stop();
              } catch {}
            });
          if (stream.getTracks().length === 0) peerStreams.delete(uiPeerId);
          else peerStreams.set(uiPeerId, stream);
        }
        return {
          ...prev,
          peerStreams,
          remoteStreams: rebuildRemoteStreamsFromPeerStreams(peerStreams),
        };
      });
    },
    [rebuildRemoteStreamsFromPeerStreams],
  );

  const stopLocalTracks = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      localStreamRef.current = null;
    }
    setState((prev) => ({ ...prev, localStream: null }));
  }, []);

  // =============================
  // URL Factory (user provided)
  // =============================

  const getProtooUrl = useCallback((params: Record<string, unknown>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const hostname = 'webrtc.promisenow.store';
    const port = 4443;
    const protocol = 'wss';
    return `${protocol}://${hostname}:${port}/?${searchParams.toString()}`;
  }, []);

  useEffect(() => {
    const tabSessionId = getTabSessionId();
    const base = opts.userId ? `${opts.userId}:${opts.roomId}` : `guest:${opts.roomId}`;
    const next = `${base}:${tabSessionId}`;
    if (stablePeerIdRef.current !== next) {
      stablePeerIdRef.current = next;
    }
  }, [opts.userId, opts.roomId]);

  // =============================
  // Connect flow (merged with your code)
  // =============================

  const connect = useCallback(async () => {
    if (isConnectingRef.current || isConnectedRef.current) {
      console.log('Already connecting or connected, skipping...');
      return;
    }

    try {
      isConnectingRef.current = true;
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      if (!stablePeerIdRef.current) {
        const tabSessionId = getTabSessionId();
        const base = opts.userId ? `${opts.userId}:${opts.roomId}` : `guest:${opts.roomId}`;
        stablePeerIdRef.current = `${base}:${tabSessionId}`;
      }

      const myPeerId = stablePeerIdRef.current;
      selfPeerServerIdRef.current = myPeerId;

      const protooUrl = getProtooUrl({
        roomId: opts.roomId,
        peerId: myPeerId,
        displayName: opts.displayName,
        device: { flag: 'chrome' },
        forceTcp: !!opts.forceTcp,
        produce: opts.produce,
        consume: opts.consume,
        mic: opts.mic,
        webcam: opts.webcam,
      });

      console.log('Connecting to:', protooUrl);

      const transport = new protooClient.WebSocketTransport(protooUrl);
      const protoo = new protooClient.Peer(transport);
      protooRef.current = protoo;

      protoo.on('open', () => {
        console.log('WebSocket open → joinRoom');
        joinRoom();
      });

      protoo.on('failed', () => {
        console.error('WebSocket connection failed');
        isConnectingRef.current = false;
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: 'WebSocket connection failed',
        }));
      });

      protoo.on('disconnected', () => {
        console.warn('WebSocket disconnected');
        isConnectedRef.current = false;
        setState((prev) => ({ ...prev, isConnected: false, error: 'WebSocket disconnected' }));
      });

      protoo.on('close', () => {
        console.warn('[ws] closed');
        isConnectedRef.current = false;
        hasJoinedRef.current = false;
        isJoiningRef.current = false;
        setState((prev) => ({ ...prev, isConnected: false }));
      });

      protoo.on('request', async (request, accept, reject) => {
        if (request.method === 'newConsumer') {
          const {
            peerId: remotePeerId,
            id,
            producerId,
            kind,
            rtpParameters,
            appData,
          } = request.data;

          try {
            if (!recvTransportRef.current) {
              reject(500, 'No receive transport');
              return;
            }

            const consumer = await recvTransportRef.current.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              appData: { ...appData, peerId: remotePeerId },
            });

            consumersRef.current.set(consumer.id, { consumer, peerId: remotePeerId, kind });

            const uiId = toUiPeerId(remotePeerId, false);
            const track = consumer.track!;
            upsertPeerTrack(uiId, track); // ⬅️ merge-by-kind into the same peer stream

            accept({ id: consumer.id } as any);
          } catch (err) {
            console.error('Failed to consume:', err);
            reject(500, 'Failed to consume');
          }
        }
      });

      protoo.on('notification', async (notification: any) => {
        const { method, data } = notification;
        switch (method) {
          case 'newPeer': {
            const { id: peerServerId, displayName } = data;
            const uiId = toUiPeerId(peerServerId, false);
            upsertPeer({
              id: uiId,
              displayName: displayName || 'Guest',
              isSelf: false,
              joinedAt: Date.now(),
            });
            break;
          }

          case 'peerClosed': {
            const { peerId: peerServerId } = data;
            removePeer(peerServerId);
            break;
          }

          case 'consumerClosed': {
            const { consumerId } = data;
            const entry = consumersRef.current.get(consumerId);
            if (!entry) break;
            try {
              entry.consumer.close();
            } catch {}
            consumersRef.current.delete(consumerId);
            const uiId = toUiPeerId(entry.peerId, false);
            removePeerTrack(uiId, entry.kind); // remove from stream → UI shows Profile & OFF icon
            break;
          }

          // ⬇️ NEW: react to remote pause/resume
          case 'consumerPaused': {
            const { consumerId } = data; // typical payload
            const entry = consumersRef.current.get(consumerId);
            if (!entry) break;
            try {
              entry.consumer.pause();
            } catch {}
            const uiId = toUiPeerId(entry.peerId, false);
            removePeerTrack(uiId, entry.kind); // ensure no black frame: hide track from stream
            break;
          }

          case 'consumerResumed': {
            const { consumerId } = data;
            const entry = consumersRef.current.get(consumerId);
            if (!entry) break;
            try {
              entry.consumer.resume();
            } catch {}
            const uiId = toUiPeerId(entry.peerId, false);
            const track = entry.consumer.track as MediaStreamTrack | undefined;
            if (track) upsertPeerTrack(uiId, track); // put back track → UI shows video/audio again
            break;
          }

          case 'peers': {
            const { peers: list } = data || {};
            if (Array.isArray(list)) {
              for (const p of list) {
                const uiId = toUiPeerId(p.id, false);
                upsertPeer({
                  id: uiId,
                  displayName: p.displayName || 'Guest',
                  isSelf: false,
                  joinedAt: Date.now(),
                });
              }
            }
            break;
          }

          default:
            break;
        }
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      isConnectingRef.current = false;
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error?.message ?? 'Connection failed',
      }));
    }
  }, [
    getProtooUrl,
    opts.roomId,
    opts.displayName,
    opts.forceTcp,
    opts.produce,
    opts.consume,
    opts.mic,
    opts.webcam,
    toUiPeerId,
    upsertPeerTrack,
    upsertPeer,
    removePeer,
    removePeerTrack,
  ]);

  const joinRoom = useCallback(async () => {
    try {
      if (!protooRef.current) return;

      // 1) Router RTP Capabilities
      const routerRtpCapabilities = await protooRef.current.request('getRouterRtpCapabilities');

      // 2) Device
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities });
      deviceRef.current = device;

      // 3) Create Send Transport
      const sendTransportInfo = await protooRef.current.request('createWebRtcTransport', {
        forceTcp: !!opts.forceTcp,
        producing: true,
        consuming: false,
        sctpCapabilities: device.sctpCapabilities,
      });

      {
        const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
          sendTransportInfo;
        const sendTransport = device.createSendTransport({
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters: { ...dtlsParameters, role: 'auto' },
          sctpParameters,
          iceServers: [],
        });
        sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            await protooRef.current!.request('connectWebRtcTransport', {
              transportId: sendTransport.id,
              dtlsParameters,
            });
            callback();
          } catch (error) {
            errback(error as Error);
          }
        });
        sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            const response = await protooRef.current!.request('produce', {
              transportId: sendTransport.id,
              kind,
              rtpParameters,
              appData,
            });
            callback({ id: response.id });
          } catch (error) {
            errback(error as Error);
          }
        });
        sendTransportRef.current = sendTransport;
      }

      // 4) Create Recv Transport
      const recvTransportInfo = await protooRef.current.request('createWebRtcTransport', {
        forceTcp: !!opts.forceTcp,
        producing: false,
        consuming: true,
        sctpCapabilities: device.sctpCapabilities,
      });

      {
        const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
          recvTransportInfo;
        const recvTransport = device.createRecvTransport({
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters: { ...dtlsParameters, role: 'auto' },
          sctpParameters,
          iceServers: [],
        });
        recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            await protooRef.current!.request('connectWebRtcTransport', {
              transportId: recvTransport.id,
              dtlsParameters,
            });
            callback();
          } catch (error) {
            errback(error as Error);
          }
        });
        recvTransportRef.current = recvTransport;
      }

      // 5) Join room (server may start sending notifications: newPeer, etc.)
      let joinResp: any;
      try {
        joinResp = await protooRef.current.request('join', {
          displayName: opts.displayName,
          device: { flag: 'chrome' },
          rtpCapabilities: device.rtpCapabilities,
          sctpCapabilities: device.sctpCapabilities,
        });
      } catch (err: any) {
        const msg = err?.message || String(err);
        const code = err?.code ?? err?.data?.code;
        if (/(already\s+joined)/i.test(msg) || code === 409 || code === 403) {
          console.warn('[join] server says already joined → continue');
        } else {
          throw err;
        }
      }

      console.log('[join] response:', joinResp);

      if (joinResp && Array.isArray(joinResp.peers)) {
        for (const p of joinResp.peers) {
          const uiId = toUiPeerId(p.id, false);
          upsertPeer({
            id: uiId,
            displayName: p.displayName || 'Guest',
            isSelf: false,
            joinedAt: Date.now(),
          });
        }
      }

      // Mark connected/ready
      isConnectingRef.current = false;
      isConnectedRef.current = true;
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        isTransportReady: !!(
          deviceRef.current &&
          sendTransportRef.current &&
          recvTransportRef.current
        ),
      }));

      upsertPeer({
        id: selfUiIdRef.current,
        displayName: opts.displayName || 'Me',
        isSelf: true,
        joinedAt: Date.now(),
      });

      // 초기 자동 시작 옵션
      if (opts.mic) await enableMic();
      if (opts.webcam) await enableWebcam();
    } catch (error: any) {
      console.error('Join room error:', error);
      isConnectingRef.current = false;
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error?.message ?? 'Failed to join room',
      }));
    }
  }, [opts.displayName, opts.forceTcp, opts.mic, opts.webcam, upsertPeer]);

  // =============================
  // Transport readiness helper
  // =============================

  const waitForTransportReady = useCallback(async (timeoutMs = 5000) => {
    const start = Date.now();
    while (
      (!sendTransportRef.current || !recvTransportRef.current || !deviceRef.current) &&
      Date.now() - start < timeoutMs
    ) {
      await new Promise((r) => setTimeout(r, 50));
    }
    if (!sendTransportRef.current || !recvTransportRef.current || !deviceRef.current) {
      throw new Error('Transport not ready');
    }
  }, []);

  // =============================
  // Local media control
  // =============================

  const enableMic = useCallback(async () => {
    try {
      await waitForTransportReady();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];

      const producer = await sendTransportRef.current!.produce({
        track,
        codecOptions: { opusStereo: true, opusDtx: true },
      });

      // 로컬 스트림 합치기
      const merged = localStreamRef.current ?? new MediaStream();
      merged.getAudioTracks().forEach((t) => {
        merged.removeTrack(t);
        try {
          t.stop();
        } catch {}
      });
      merged.addTrack(track);
      localStreamRef.current = merged;

      upsertPeerTrack(selfUiIdRef.current, track);

      setState((prev) => ({ ...prev, micProducer: producer, localStream: merged }));
    } catch (error: any) {
      console.error('Enable mic error:', error);
      setState((prev) => ({ ...prev, error: error?.message ?? 'Failed to enable microphone' }));
    }
  }, [upsertPeerTrack, waitForTransportReady]);

  const enableWebcam = useCallback(async () => {
    try {
      await waitForTransportReady();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const track = stream.getVideoTracks()[0];

      const producer = await sendTransportRef.current!.produce({ track });

      const merged = localStreamRef.current ?? new MediaStream();
      merged.getVideoTracks().forEach((t) => {
        merged.removeTrack(t);
        try {
          t.stop();
        } catch {}
      });
      merged.addTrack(track);
      localStreamRef.current = merged;

      // UI 일관성: 로컬 비디오도 peerStreams 에 반영
      upsertPeerTrack(selfUiIdRef.current, track);

      setState((prev) => ({ ...prev, webcamProducer: producer, localStream: merged }));
    } catch (error: any) {
      console.error('Enable webcam error:', error);
      setState((prev) => ({ ...prev, error: error?.message ?? 'Failed to enable webcam' }));
    }
  }, [upsertPeerTrack, waitForTransportReady]);

  const muteMic = useCallback(async () => {
    try {
      await state.micProducer?.pause();
    } catch (e) {
      console.error('muteMic error:', e);
    } finally {
      setState((prev) => ({ ...prev }));
    }
  }, [state.micProducer]);

  const unmuteMic = useCallback(async () => {
    try {
      await state.micProducer?.resume();
    } catch (e) {
      console.error('unmuteMic error:', e);
    } finally {
      setState((prev) => ({ ...prev }));
    }
  }, [state.micProducer]);

  const muteWebcam = useCallback(async () => {
    try {
      await state.webcamProducer?.pause();
    } catch (e) {
      console.error('muteWebcam error:', e);
    } finally {
      setState((prev) => ({ ...prev }));
    }
  }, [state.webcamProducer]);

  const unmuteWebcam = useCallback(async () => {
    try {
      await state.webcamProducer?.resume();
    } catch (e) {
      console.error('unmuteWebcam error:', e);
    } finally {
      setState((prev) => ({ ...prev }));
    }
  }, [state.webcamProducer]);

  // =============================
  // Disconnect
  // =============================

  const disconnect = useCallback(() => {
    try {
      // producers
      try {
        state.micProducer?.close();
      } catch {}
      try {
        state.webcamProducer?.close();
      } catch {}

      // consumers
      for (const [, entry] of consumersRef.current) {
        try {
          entry.consumer.close();
        } catch {}
      }
      consumersRef.current.clear();

      // transports
      try {
        sendTransportRef.current?.close();
      } catch {}
      try {
        recvTransportRef.current?.close();
      } catch {}
      sendTransportRef.current = null;
      recvTransportRef.current = null;

      // device
      deviceRef.current = null;

      // protoo
      try {
        protooRef.current?.close();
      } catch {}
      protooRef.current = null;

      // local tracks
      stopLocalTracks();

      // state reset
      setState({ ...initialState });
      isConnectedRef.current = false;
      isConnectingRef.current = false;
    } catch (err) {
      console.error('disconnect error:', err);
      setState((p) => ({ ...p, error: 'Failed to disconnect' }));

      hasJoinedRef.current = false;
      isJoiningRef.current = false;
    }
  }, [state.micProducer, state.webcamProducer, stopLocalTracks]);

  // =============================
  // Expose
  // =============================

  return {
    // 연결 상태
    isConnecting: state.isConnecting,
    isConnected: state.isConnected,
    isTransportReady: state.isTransportReady,
    error: state.error,

    // 피어/스트림
    peers: state.peers,
    peerStreams: state.peerStreams,
    remoteStreams: state.remoteStreams,
    localStream: state.localStream,

    // 프로듀서
    micProducer: state.micProducer,
    webcamProducer: state.webcamProducer,

    // 제어 API
    connect,
    joinRoom,
    disconnect,
    enableMic,
    enableWebcam,
    muteMic,
    unmuteMic,
    muteWebcam,
    unmuteWebcam,
  };
}
