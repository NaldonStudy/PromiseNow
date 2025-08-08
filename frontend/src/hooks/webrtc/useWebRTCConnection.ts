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
      console.log('WebRTC 연결 URL:', protooUrl);
      
      const protooTransport = new protooClient.WebSocketTransport(protooUrl);
      _protoo.current = new protooClient.Peer(protooTransport);

      _protoo.current.on('open', async () => {
        console.log('Protoo 연결 성공');
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
        console.log('Protoo 요청 수신:', request);
        if (request.method === 'newConsumer') {
          try {
            console.log('새로운 Consumer 요청:', request.data);
            const consumer = await _recvTransport.current.consume(request.data);
            _consumers.current.set(consumer.id, consumer);

            console.log(`새로운 Consumer 생성 성공: ${consumer.kind} - ID: ${consumer.id}`);

            if (consumer.kind === 'video') {
              const remoteStream = new MediaStream([consumer.track]);
              console.log('원격 비디오 스트림 생성:', remoteStream);
              setState(prev => ({
                ...prev,
                remoteStreams: new Map(prev.remoteStreams.set(consumer.id, remoteStream))
              }));
            }

            consumer.on('transportclose', () => {
              console.log('Consumer transport 종료:', consumer.id);
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
        console.log('Protoo 알림 수신:', notification);

        switch (notification.method) {
          case 'newPeer': {
            const peer = notification.data;
            console.log('새로운 참가자 입장:', peer);
            onPeerJoined?.(peer.id);
            break;
          }
          case 'peerClosed': {
            const peer = notification.data;
            console.log('참가자 퇴장:', peer);
            onPeerLeft?.(peer.id);
            break;
          }
          case 'newConsumer': {
            console.log('newConsumer 알림 수신:', notification.data);
            break;
          }
          case 'consumerClosed': {
            console.log('consumerClosed 알림 수신:', notification.data);
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
      console.log('미디어스프 디바이스 생성 중...');
      _mediasoupDevice.current = new mediasoupClient.Device();
      const routerRtpCapabilities = await _protoo.current.request('getRouterRtpCapabilities');
      console.log('Router RTP Capabilities:', routerRtpCapabilities);
      
      await _mediasoupDevice.current.load({
        routerRtpCapabilities,
      });
      console.log('미디어스프 디바이스 로드 완료');

      // 송출용 Transport 생성
      console.log('송출용 Transport 생성 중...');
      const sendTransportInfo = await _protoo.current.request('createWebRtcTransport', {
        producing: true,
        consuming: false,
      });
      console.log('송출용 Transport 정보:', sendTransportInfo);
      
      _sendTransport.current = _mediasoupDevice.current.createSendTransport(sendTransportInfo);

      _sendTransport.current.on(
        'connect',
        async ({ dtlsParameters }: any, callback: () => void) => {
          try {
            console.log('송출용 Transport 연결 중...');
            await _protoo.current.request('connectWebRtcTransport', {
              transportId: _sendTransport.current.id,
              dtlsParameters,
            });
            console.log('송출용 Transport 연결 성공');
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
            console.log(`${kind} Producer 생성 요청:`, parameters);
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
      console.log('수신용 Transport 생성 중...');
      const recvTransportInfo = await _protoo.current.request('createWebRtcTransport', {
        producing: false,
        consuming: true,
      });
      console.log('수신용 Transport 정보:', recvTransportInfo);
      
      _recvTransport.current = _mediasoupDevice.current.createRecvTransport(recvTransportInfo);
      _recvTransport.current.on(
        'connect',
        async ({ dtlsParameters }: any, callback: () => void) => {
          try {
            console.log('수신용 Transport 연결 중...');
            await _protoo.current.request('connectWebRtcTransport', {
              transportId: _recvTransport.current.id,
              dtlsParameters,
            });
            console.log('수신용 Transport 연결 성공');
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
      console.log('오디오 스트림 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      console.log('오디오 트랙:', audioTrack);
      
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
      console.log('비디오 스트림 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      console.log('비디오 트랙:', videoTrack);
      
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