import { useRef, useCallback, useEffect, useState } from 'react';
import protooClient from 'protoo-client';
import * as mediasoupClient from 'mediasoup-client';
import { v4 as uuidv4 } from 'uuid';

interface WebRTCConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

interface UseWebRTCConnectionProps {
  roomId: string;
  onPeerJoined?: (peerId: string) => void;
  onPeerLeft?: (peerId: string) => void;
}

export const useWebRTCConnection = ({ roomId, onPeerJoined, onPeerLeft }: UseWebRTCConnectionProps) => {
  const [state, setState] = useState<WebRTCConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    localStream: null,
    remoteStreams: new Map(),
  });

  const _protoo = useRef<any>(null);
  const _mediasoupDevice = useRef<any>(null);
  const _recvTransport = useRef<any>(null);
  const _sendTransport = useRef<any>(null);
  const _consumers = useRef<Map<string, any>>(new Map());
  const _producers = useRef<Map<string, any>>(new Map());

  const connect = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const peerId = uuidv4();
      const protooUrl = `wss://webrtc.promisenow.store/ws/?roomId=${roomId}&peerId=${peerId}`;
      const protooTransport = new protooClient.WebSocketTransport(protooUrl);
      _protoo.current = new protooClient.Peer(protooTransport);

      _protoo.current.on('open', async () => {
        try {
          await joinRoom();
        } catch (error) {
          console.error('방 참여 실패:', error);
          setState(prev => ({ ...prev, error: '방 참여에 실패했습니다.' }));
        }
      });

      _protoo.current.on('close', () => {
        console.log('WebRTC 연결 종료');
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
      });

      _protoo.current.on('request', async (request: any, accept: () => void) => {
        console.log('Protoo 요청:', request);
        if (request.method === 'newConsumer') {
          try {
            const consumer = await _recvTransport.current.consume(request.data);
            _consumers.current.set(consumer.id, consumer);

            console.log(`새로운 Consumer 생성: ${consumer.kind} - ID: ${consumer.id}`);

            if (consumer.kind === 'video') {
              const remoteStream = new MediaStream([consumer.track]);
              setState(prev => ({
                ...prev,
                remoteStreams: new Map(prev.remoteStreams.set(consumer.id, remoteStream))
              }));
            }

            consumer.on('transportclose', () => {
              _consumers.current.delete(consumer.id);
              setState(prev => {
                const newRemoteStreams = new Map(prev.remoteStreams);
                newRemoteStreams.delete(consumer.id);
                return { ...prev, remoteStreams: newRemoteStreams };
              });
            });

            accept();
          } catch (error) {
            console.error('Consumer 생성 실패:', error);
          }
        }
      });

      _protoo.current.on('notification', (notification: any) => {
        console.log('Protoo 알림:', notification);

        switch (notification.method) {
          case 'newPeer': {
            const peer = notification.data;
            onPeerJoined?.(peer.id);
            break;
          }
          case 'peerClosed': {
            const peer = notification.data;
            onPeerLeft?.(peer.id);
            break;
          }
        }
      });

    } catch (error) {
      console.error('WebRTC 연결 실패:', error);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: 'WebRTC 연결에 실패했습니다.' 
      }));
    }
  }, [roomId, state.isConnecting, state.isConnected, onPeerJoined, onPeerLeft]);

  const joinRoom = async () => {
    try {
      _mediasoupDevice.current = new mediasoupClient.Device();
      const routerRtpCapabilities = await _protoo.current.request('getRouterRtpCapabilities');
      await _mediasoupDevice.current.load({
        routerRtpCapabilities,
      });

      // 송출용 Transport 생성
      const sendTransportInfo = await _protoo.current.request('createWebRtcTransport', {
        producing: true,
        consuming: false,
      });
      _sendTransport.current = _mediasoupDevice.current.createSendTransport(sendTransportInfo);

      _sendTransport.current.on(
        'connect',
        async ({ dtlsParameters }: any, callback: () => void) => {
          try {
            await _protoo.current.request('connectWebRtcTransport', {
              transportId: _sendTransport.current.id,
              dtlsParameters,
            });
            callback();
          } catch (error) {
            console.error('WebRTC SendTransport 연결 실패:', error);
          }
        },
      );

      _sendTransport.current.on(
        'produce',
        async (
          parameters: { kind: any; rtpParameters: any },
          callback: (arg0: { id: any }) => void,
        ) => {
          try {
            const { kind, rtpParameters } = parameters;
            const id = await _protoo.current.request('produce', {
              transportId: _sendTransport.current.id,
              kind,
              rtpParameters,
            });
            console.log(`미디어 송출 성공: ${kind} - ID: ${id}`);
            callback({ id });
          } catch (error) {
            console.error('미디어 송출 실패:', error);
          }
        },
      );

      // 수신용 Transport 생성
      const recvTransportInfo = await _protoo.current.request('createWebRtcTransport', {
        producing: false,
        consuming: true,
      });
      _recvTransport.current = _mediasoupDevice.current.createRecvTransport(recvTransportInfo);
      _recvTransport.current.on(
        'connect',
        async ({ dtlsParameters }: any, callback: () => void) => {
          try {
            await _protoo.current.request('connectWebRtcTransport', {
              transportId: _recvTransport.current.id,
              dtlsParameters,
            });
            callback();
          } catch (error) {
            console.error('WebRTC RecvTransport 연결 실패:', error);
          }
        },
      );

      const { peers } = await _protoo.current.request('join', {
        displayName: '사용자',
        device: 'browser',
      });
      console.log('방 참여 성공:', peers);
      
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false 
      }));

    } catch (error) {
      console.error('방 참여 중 오류 발생:', error);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: '방 참여에 실패했습니다.' 
      }));
    }
  };

  const enableAudio = useCallback(async () => {
    if (!_sendTransport.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      const audioProducer = await _sendTransport.current.produce({ track: audioTrack });
      _producers.current.set(audioProducer.id, audioProducer);
      
      setState(prev => ({ ...prev, localStream: stream }));
      console.log('오디오 활성화 성공');
    } catch (error) {
      console.error('마이크 활성화 중 오류 발생:', error);
    }
  }, []);

  const enableVideo = useCallback(async () => {
    if (!_sendTransport.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const videoProducer = await _sendTransport.current.produce({ track: videoTrack });
      _producers.current.set(videoProducer.id, videoProducer);
      
      setState(prev => ({ ...prev, localStream: stream }));
      console.log('비디오 활성화 성공');
    } catch (error) {
      console.error('비디오 활성화 중 오류 발생:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      if (_protoo.current) {
        _protoo.current.close();
        _protoo.current = null;
      }
      if (_sendTransport.current) {
        _sendTransport.current.close();
        _sendTransport.current = null;
      }
      if (_recvTransport.current) {
        _recvTransport.current.close();
        _recvTransport.current = null;
      }
      _consumers.current.clear();
      _producers.current.clear();
      
      setState({
        isConnected: false,
        isConnecting: false,
        error: null,
        localStream: null,
        remoteStreams: new Map(),
      });
      
      console.log('WebRTC 연결 해제 완료');
    } catch (e) {
      console.error('연결 해제 중 오류:', e);
    }
  }, []);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    enableAudio,
    enableVideo,
  };
}; 