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

interface ConsumerData {
  peerId: string;
  producerId: string;
  id: string;
  kind: string;
  rtpParameters: any;
  type: string;
  appData: any;
}

interface ConsumerClosedData {
  consumerId: string;
}

export const useWebRTCConnection = ({ roomId, onPeerJoined, onPeerLeft }: UseWebRTCConnectionProps) => {
  const [state, setState] = useState<WebRTCConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    localStream: null,
    remoteStreams: new Map(),
  });

  const _protoo = useRef<protooClient.Peer | null>(null);
  const _device = useRef<mediasoupClient.Device | null>(null);
  const _sendTransport = useRef<any>(null);
  const _recvTransport = useRef<any>(null);
  const _producers = useRef<Map<string, any>>(new Map());
  const _consumers = useRef<Map<string, any>>(new Map());
  const _localStream = useRef<MediaStream | null>(null);
  const _isConnecting = useRef(false);

  const connect = useCallback(async () => {
    // 이미 연결 중이면 중복 연결 방지
    if (_isConnecting.current || state.isConnected) {
      console.log('이미 연결 중이거나 연결된 상태입니다.');
      return;
    }

    try {
      _isConnecting.current = true;
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      const peerId = uuidv4();
      const url = `wss://webrtc.promisenow.store/ws/?roomId=${roomId}&peerId=${peerId}`;
      console.log('WebRTC 연결 URL:', url);

      // Protoo 연결
      const transport = new protooClient.WebSocketTransport(url);
      _protoo.current = new protooClient.Peer(transport);
      
      // 연결 완료를 기다리는 Promise
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket 연결 시간 초과'));
        }, 10000); // 10초 타임아웃

        _protoo.current!.on('open', () => {
          console.log('Protoo 연결 성공');
          clearTimeout(timeout);
          resolve();
        });

        _protoo.current!.on('disconnected', () => {
          console.log('Protoo 연결 해제');
          setState(prev => ({ ...prev, isConnected: false }));
        });

        _protoo.current!.on('close', () => {
          console.log('Protoo 연결 종료');
          setState(prev => ({ ...prev, isConnected: false }));
        });
      });

      // 연결 완료 대기
      await connectionPromise;

      // 미디어스프 디바이스 생성
      console.log('미디어스프 디바이스 생성 중...');
      _device.current = new mediasoupClient.Device();

      // Router RTP Capabilities 요청
      const routerRtpCapabilities = await _protoo.current.request('getRouterRtpCapabilities');
      console.log('Router RTP Capabilities:', routerRtpCapabilities);

      // 디바이스 로드
      await _device.current.load({ routerRtpCapabilities });
      console.log('미디어스프 디바이스 로드 완료');

      // 송출용 Transport 생성
      console.log('송출용 Transport 생성 중...');
      const { id: sendTransportId, iceParameters, iceCandidates, dtlsParameters } = 
        await _protoo.current.request('createWebRtcTransport', {
          forceTcp: false,
          producing: true,
          consuming: false,
          sctpCapabilities: _device.current.sctpCapabilities
        });

      console.log('송출용 Transport 정보:', { id: sendTransportId, iceParameters, iceCandidates, dtlsParameters });

      _sendTransport.current = _device.current.createSendTransport({
        id: sendTransportId,
        iceParameters,
        iceCandidates,
        dtlsParameters
      });

      _sendTransport.current.on('connect', async ({ dtlsParameters }: { dtlsParameters: any }, callback: () => void, errback: (error: any) => void) => {
        console.log('송출용 Transport 연결 중...');
        try {
          await _protoo.current!.request('connectWebRtcTransport', {
            transportId: _sendTransport.current!.id,
            dtlsParameters
          });
          console.log('송출용 Transport 연결 성공');
          callback();
        } catch (error) {
          console.error('송출용 Transport 연결 실패:', error);
          errback(error);
        }
      });

      _sendTransport.current.on('produce', async ({ kind, rtpParameters, appData }: { kind: string; rtpParameters: any; appData: any }, callback: (data: any) => void, errback: (error: any) => void) => {
        console.log(`${kind} Producer 생성 요청:`, { kind, rtpParameters, appData });
        try {
          const { id } = await _protoo.current!.request('produce', {
            transportId: _sendTransport.current!.id,
            kind,
            rtpParameters,
            appData
          });
          console.log('미디어 송출 성공:', kind, '- ID:', id);
          callback({ id });
        } catch (error) {
          console.error('미디어 송출 실패:', error);
          errback(error);
        }
      });

      // 수신용 Transport 생성
      console.log('수신용 Transport 생성 중...');
      const { id: recvTransportId, iceParameters: recvIceParameters, iceCandidates: recvIceCandidates, dtlsParameters: recvDtlsParameters } = 
        await _protoo.current.request('createWebRtcTransport', {
          forceTcp: false,
          producing: false,
          consuming: true,
          sctpCapabilities: _device.current.sctpCapabilities
        });

      console.log('수신용 Transport 정보:', { id: recvTransportId, iceParameters: recvIceParameters, iceCandidates: recvIceCandidates, dtlsParameters: recvDtlsParameters });

      _recvTransport.current = _device.current.createRecvTransport({
        id: recvTransportId,
        iceParameters: recvIceParameters,
        iceCandidates: recvIceCandidates,
        dtlsParameters: recvDtlsParameters
      });

      _recvTransport.current.on('connect', async ({ dtlsParameters }: { dtlsParameters: any }, callback: () => void, errback: (error: any) => void) => {
        console.log('수신용 Transport 연결 중...');
        try {
          await _protoo.current!.request('connectWebRtcTransport', {
            transportId: _recvTransport.current!.id,
            dtlsParameters
          });
          console.log('수신용 Transport 연결 성공');
          callback();
        } catch (error) {
          console.error('수신용 Transport 연결 실패:', error);
          errback(error);
        }
      });

      // 방 참여
      const { peers } = await _protoo.current.request('join', {
        displayName: '사용자',
        device: { name: 'browser', version: '1.0.0' }
      });
      console.log('방 참여 성공:', peers);

      // 알림 핸들러 설정
      _protoo.current.on('notification', (notification) => {
        console.log('Protoo 알림 수신:', notification);
        
        switch (notification.method) {
          case 'newPeer':
            console.log('새로운 참가자 입장:', notification.data);
            onPeerJoined?.(notification.data.id);
            break;
            
          case 'peerClosed':
            console.log('참가자 퇴장:', notification.data);
            onPeerLeft?.(notification.data.peerId);
            break;
            
          case 'newConsumer':
            handleNewConsumer(notification.data as ConsumerData);
            break;
            
          case 'consumerClosed':
            handleConsumerClosed(notification.data as ConsumerClosedData);
            break;
        }
      });

      setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
      _isConnecting.current = false;

    } catch (error) {
      console.error('WebRTC 연결 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setState(prev => ({ ...prev, error: errorMessage, isConnecting: false }));
      _isConnecting.current = false;
    }
  }, [roomId, onPeerJoined, onPeerLeft, state.isConnected]);

  const handleNewConsumer = async (data: ConsumerData) => {
    console.log('newConsumer 알림 수신:', data);
    
    try {
      const { peerId, producerId, id, kind, rtpParameters, type, appData } = data;
      
      console.log('새로운 Consumer 요청:', { peerId, producerId, id, kind, type });
      
      const consumer = await _recvTransport.current!.consume({
        id,
        producerId,
        kind,
        rtpParameters,
        appData
      });

      _consumers.current.set(consumer.id, consumer);

      consumer.on('transportclose', () => {
        console.log('Consumer transport 종료:', consumer.id);
        _consumers.current.delete(consumer.id);
      });

      consumer.on('producerclose', () => {
        console.log('Consumer producer 종료:', consumer.id);
        _consumers.current.delete(consumer.id);
        setState(prev => {
          const newRemoteStreams = new Map(prev.remoteStreams);
          newRemoteStreams.delete(consumer.id);
          return { ...prev, remoteStreams: newRemoteStreams };
        });
      });

      // Consumer 확인
      await _protoo.current!.request('resumeConsumer', { consumerId: consumer.id });

      // 원격 스트림 생성
      const stream = new MediaStream([consumer.track]);
      setState(prev => {
        const newRemoteStreams = new Map(prev.remoteStreams);
        newRemoteStreams.set(consumer.id, stream);
        return { ...prev, remoteStreams: newRemoteStreams };
      });

      console.log('원격 비디오 스트림 생성:', consumer.id, stream);

    } catch (error) {
      console.error('Consumer 생성 실패:', error);
    }
  };

  const handleConsumerClosed = (data: ConsumerClosedData) => {
    console.log('Consumer 종료:', data);
    const { consumerId } = data;
    
    const consumer = _consumers.current.get(consumerId);
    if (consumer) {
      consumer.close();
      _consumers.current.delete(consumerId);
    }

    setState(prev => {
      const newRemoteStreams = new Map(prev.remoteStreams);
      newRemoteStreams.delete(consumerId);
      return { ...prev, remoteStreams: newRemoteStreams };
    });
  };

  const enableAudio = useCallback(async () => {
    if (!_sendTransport.current) return;

    try {
      console.log('오디오 스트림 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      console.log('오디오 트랙:', track);

      const producer = await _sendTransport.current.produce({ track });
      _producers.current.set(producer.id, producer);
      _localStream.current = stream;

      setState(prev => ({ ...prev, localStream: stream }));
      console.log('오디오 활성화 성공');
    } catch (error) {
      console.error('오디오 활성화 실패:', error);
    }
  }, []);

  const enableVideo = useCallback(async () => {
    if (!_sendTransport.current) return;

    try {
      console.log('비디오 스트림 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      console.log('비디오 트랙:', track);

      const producer = await _sendTransport.current.produce({ track });
      _producers.current.set(producer.id, producer);

      if (_localStream.current) {
        _localStream.current.addTrack(track);
      } else {
        _localStream.current = stream;
        setState(prev => ({ ...prev, localStream: stream }));
      }

      console.log('비디오 활성화 성공');
    } catch (error) {
      console.error('비디오 활성화 실패:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (_protoo.current) {
      _protoo.current.close();
      _protoo.current = null;
    }

    if (_localStream.current) {
      _localStream.current.getTracks().forEach(track => track.stop());
      _localStream.current = null;
    }

    _producers.current.clear();
    _consumers.current.clear();
    _device.current = null;
    _sendTransport.current = null;
    _recvTransport.current = null;
    _isConnecting.current = false;

    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      localStream: null,
      remoteStreams: new Map(),
    });
  }, []);

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