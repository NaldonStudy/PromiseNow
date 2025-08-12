import { useCallback, useEffect, useRef, useState } from 'react';
import protooClient from 'protoo-client';
import * as mediasoupClient from 'mediasoup-client';

// Types
interface MediasoupConfig {
  roomId: string;
  peerId?: string;
  displayName?: string;
  produce?: boolean;
  consume?: boolean;
  mic?: boolean;
  webcam?: boolean;
  forceTcp?: boolean;
}

interface MediasoupState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  micProducer: {
    id: string;
    paused: boolean;
    close: () => void;
    pause: () => void;
    resume: () => void;
  } | null;
  webcamProducer: {
    id: string;
    paused: boolean;
    close: () => void;
    pause: () => void;
    resume: () => void;
  } | null;
  consumers: Map<string, { id: string; track: MediaStreamTrack; close: () => void }>;
}

interface MediasoupActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  enableMic: () => Promise<void>;
  disableMic: () => Promise<void>;
  enableWebcam: () => Promise<void>;
  disableWebcam: () => Promise<void>;
  muteMic: () => Promise<void>;
  unmuteMic: () => Promise<void>;
  muteWebcam: () => Promise<void>;
  unmuteWebcam: () => Promise<void>;
}

const VIDEO_CONSTRAINTS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export const useMediasoupClient = (config: MediasoupConfig) => {
  const {
    roomId,
    peerId = `peer-${Math.random().toString(36).substr(2, 9)}`,
    displayName = 'Anonymous',
    produce = true,
    consume = true,
    mic = true,
    webcam = true,
    forceTcp = false,
  } = config;

  // State
  const [state, setState] = useState<MediasoupState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    localStream: null,
    remoteStreams: new Map(),
    micProducer: null,
    webcamProducer: null,
    consumers: new Map(),
  });

  // Refs
  const protooRef = useRef<protooClient.Peer | null>(null);
  const sendTransportRef = useRef<ReturnType<mediasoupClient.Device['createSendTransport']> | null>(
    null,
  );
  const recvTransportRef = useRef<ReturnType<mediasoupClient.Device['createRecvTransport']> | null>(
    null,
  );
  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);

  // URL Factory
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

  // Connect to mediasoup server
  const connect = useCallback(async () => {
    // 중복 연결 방지
    if (isConnectingRef.current || isConnectedRef.current) {
      console.log('Already connecting or connected, skipping...');
      return;
    }

    try {
      isConnectingRef.current = true;
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      const protooUrl = getProtooUrl({
        roomId,
        peerId,
        displayName,
        device: { flag: 'chrome' },
        forceTcp,
        produce,
        consume,
        mic,
        webcam,
      });

      console.log('Connecting to:', protooUrl);

      const protooTransport = new protooClient.WebSocketTransport(protooUrl);
      const protoo = new protooClient.Peer(protooTransport);
      protooRef.current = protoo;

      // Setup protoo event handlers
      protoo.on('open', () => {
        console.log('WebSocket connection opened successfully');
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
        console.log('WebSocket disconnected');
        isConnectedRef.current = false;
        setState((prev) => ({
          ...prev,
          isConnected: false,
          error: 'WebSocket disconnected',
        }));
      });

      protoo.on('close', () => {
        console.log('WebSocket closed');
        isConnectedRef.current = false;
        setState((prev) => ({ ...prev, isConnected: false }));
      });

      // Handle server requests
      protoo.on('request', async (request, accept, reject) => {
        console.log('proto request:', request.method, request.data);

        switch (request.method) {
          case 'newConsumer': {
            if (!consume) {
              reject(403, 'I do not want to consume');
              break;
            }

            const {
              peerId: remotePeerId,
              producerId,
              id,
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
                streamId: `${remotePeerId}-${appData.share ? 'share' : 'mic-webcam'}`,
                appData: { ...appData, peerId: remotePeerId },
              });

              // Store consumer
              setState((prev) => {
                const newConsumers = new Map(prev.consumers);
                newConsumers.set(consumer.id, consumer);
                return { ...prev, consumers: newConsumers };
              });

              // Add remote stream
              if (consumer.track) {
                const stream = new MediaStream([consumer.track]);
                setState((prev) => {
                  const newRemoteStreams = new Map(prev.remoteStreams);
                  newRemoteStreams.set(remotePeerId, stream);
                  return { ...prev, remoteStreams: newRemoteStreams };
                });
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              accept({ id: consumer.id } as any);
            } catch (error) {
              console.error('Failed to consume:', error);
              reject(500, 'Failed to consume');
            }
            break;
          }

          case 'newDataConsumer': {
            // Handle data consumer if needed
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            accept({ id: 0 } as any);
            break;
          }

          default:
            reject(400, `Unknown method: ${request.method}`);
        }
      });
    } catch (error) {
      console.error('Connection error:', error);
      isConnectingRef.current = false;
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, [roomId, peerId, displayName, forceTcp, produce, consume, mic, webcam, getProtooUrl]);

  // Join room
  const joinRoom = useCallback(async () => {
    try {
      if (!protooRef.current) return;

      console.log('Requesting router RTP capabilities...');
      const routerRtpCapabilities = await protooRef.current.request('getRouterRtpCapabilities');
      console.log('Router RTP capabilities response:', routerRtpCapabilities);

      // Create mediasoup device
      const device = new mediasoupClient.Device();
      console.log('Loading device with capabilities:', { routerRtpCapabilities });

      await device.load({ routerRtpCapabilities });
      deviceRef.current = device;
      console.log('Device loaded successfully');

      // Create send transport
      const sendTransportInfo = await protooRef.current.request('createWebRtcTransport', {
        forceTcp,
        producing: true,
        consuming: false,
        sctpCapabilities: device.sctpCapabilities,
      });

      console.log('Send transport info:', sendTransportInfo);

      const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
        sendTransportInfo;

      const sendTransport = device.createSendTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters: {
          ...dtlsParameters,
          role: 'auto',
        },
        sctpParameters,
        iceServers: [],
      });
      sendTransportRef.current = sendTransport;

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

      // Create receive transport
      const recvTransportInfo = await protooRef.current.request('createWebRtcTransport', {
        forceTcp,
        producing: false,
        consuming: true,
        sctpCapabilities: device.sctpCapabilities,
      });

      console.log('Recv transport info:', recvTransportInfo);

      const {
        id: recvId,
        iceParameters: recvIceParameters,
        iceCandidates: recvIceCandidates,
        dtlsParameters: recvDtlsParameters,
        sctpParameters: recvSctpParameters,
      } = recvTransportInfo;

      const recvTransport = device.createRecvTransport({
        id: recvId,
        iceParameters: recvIceParameters,
        iceCandidates: recvIceCandidates,
        dtlsParameters: {
          ...recvDtlsParameters,
          role: 'auto',
        },
        sctpParameters: recvSctpParameters,
        iceServers: [],
      });
      recvTransportRef.current = recvTransport;

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

      // Join room
      await protooRef.current.request('join', {
        displayName,
        device: { flag: 'chrome' },
        rtpCapabilities: device.rtpCapabilities,
        sctpCapabilities: device.sctpCapabilities,
      });

      isConnectingRef.current = false;
      isConnectedRef.current = true;
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
      }));
    } catch (error) {
      console.error('Join room error:', error);
      isConnectingRef.current = false;
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to join room',
      }));
    }
  }, [displayName, forceTcp]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('Disconnecting...');

    if (protooRef.current) {
      protooRef.current.close();
      protooRef.current = null;
    }

    if (sendTransportRef.current) {
      sendTransportRef.current.close();
      sendTransportRef.current = null;
    }

    if (recvTransportRef.current) {
      recvTransportRef.current.close();
      recvTransportRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    isConnectingRef.current = false;
    isConnectedRef.current = false;

    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      localStream: null,
      remoteStreams: new Map(),
      micProducer: null,
      webcamProducer: null,
      consumers: new Map(),
    });
  }, []);

  // Enable microphone
  const enableMic = useCallback(async () => {
    try {
      if (!sendTransportRef.current || !deviceRef.current) {
        throw new Error('Transport not ready');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];

      const producer = await sendTransportRef.current.produce({
        track,
        encodings: [{ maxBitrate: 128000, dtx: true }],
        codecOptions: {
          opusStereo: true,
          opusDtx: true,
        },
      });

      setState((prev) => ({
        ...prev,
        micProducer: producer,
        localStream: stream,
      }));
      localStreamRef.current = stream;
    } catch (error) {
      console.error('Enable mic error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable microphone',
      }));
    }
  }, []);

  // Disable microphone
  const disableMic = useCallback(async () => {
    try {
      if (state.micProducer) {
        state.micProducer.close();
      }

      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.stop();
        }
      }

      setState((prev) => ({
        ...prev,
        micProducer: null,
      }));
    } catch (error) {
      console.error('Disable mic error:', error);
    }
  }, [state.micProducer]);

  // Enable webcam
  const enableWebcam = useCallback(async () => {
    try {
      if (!sendTransportRef.current || !deviceRef.current) {
        throw new Error('Transport not ready');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONSTRAINTS.vga,
      });
      const track = stream.getVideoTracks()[0];

      const producer = await sendTransportRef.current.produce({
        track,
        encodings: [
          { maxBitrate: 100000, scalabilityMode: 'S1T3' },
          { maxBitrate: 300000, scalabilityMode: 'S1T3' },
          { maxBitrate: 900000, scalabilityMode: 'S1T3' },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });

      setState((prev) => ({
        ...prev,
        webcamProducer: producer,
        localStream: stream,
      }));
      localStreamRef.current = stream;
    } catch (error) {
      console.error('Enable webcam error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable webcam',
      }));
    }
  }, []);

  // Disable webcam
  const disableWebcam = useCallback(async () => {
    try {
      if (state.webcamProducer) {
        state.webcamProducer.close();
      }

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }
      }

      setState((prev) => ({
        ...prev,
        webcamProducer: null,
      }));
    } catch (error) {
      console.error('Disable webcam error:', error);
    }
  }, [state.webcamProducer]);

  // Mute/unmute functions
  const muteMic = useCallback(async () => {
    if (state.micProducer) {
      await state.micProducer.pause();
      setState((prev) => ({
        ...prev,
        micProducer: prev.micProducer,
      }));
    }
  }, [state.micProducer]);

  const unmuteMic = useCallback(async () => {
    if (state.micProducer) {
      await state.micProducer.resume();
      setState((prev) => ({
        ...prev,
        micProducer: prev.micProducer,
      }));
    }
  }, [state.micProducer]);

  const muteWebcam = useCallback(async () => {
    if (state.webcamProducer) {
      await state.webcamProducer.pause();
      setState((prev) => ({
        ...prev,
        webcamProducer: prev.webcamProducer,
      }));
    }
  }, [state.webcamProducer]);

  const unmuteWebcam = useCallback(async () => {
    if (state.webcamProducer) {
      await state.webcamProducer.resume();
      setState((prev) => ({
        ...prev,
        webcamProducer: prev.webcamProducer,
      }));
    }
  }, [state.webcamProducer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useMediasoupClient cleanup');
      disconnect();
    };
  }, [disconnect]);

  const actions: MediasoupActions = {
    connect,
    disconnect,
    enableMic,
    disableMic,
    enableWebcam,
    disableWebcam,
    muteMic,
    unmuteMic,
    muteWebcam,
    unmuteWebcam,
  };

  return { ...state, ...actions };
};
