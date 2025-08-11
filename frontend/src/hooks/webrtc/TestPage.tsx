/* eslint-disable @typescript-eslint/no-explicit-any */
import SquareBtn from '../../components/ui/SquareBtn';

import protooClient from 'protoo-client';
import * as mediasoupClient from 'mediasoup-client';
import { useEnvironmentCheck } from './environment/useEnvironmentCheck';
import { useRoomStore, usePeersStore, useMeStore, useProducersStore } from './stores';
import { useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TestPage: React.FC = () => {
  const environmentCheck = useEnvironmentCheck();
  const { setRoomState, setActiveSpeakerId } = useRoomStore();
  const { addPeer, removePeer } = usePeersStore();
  const { setMe, setMediaCapabilities, resetOnRoomClosed } = useMeStore();
  const { addProducer, resetProducers } = useProducersStore();

  const _protoo = useRef<any>(null);
  const _mediasoupDevice = useRef<any>(null);
  const _recvTransport = useRef<any>(null);
  const _sendTransport = useRef<any>(null);

  const _consumers = new Map<string, any>();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const join = async () => {
    console.log('=== 테스트 시작 ===');
    const roomId = '1';
    const peerId = uuidv4();

    try {
      const result = await environmentCheck.runEnvironmentCheck();
      console.log('환경 정보:', result);

      const _protooUrl = `wss://webrtc.promisenow.store/ws/?roomId=${roomId}&peerId=${peerId}`;
      const protooTransport = new protooClient.WebSocketTransport(_protooUrl);
      _protoo.current = new protooClient.Peer(protooTransport);

      setRoomState('connecting');

      _protoo.current.on('open', joinRoom);
      _protoo.current.on('close', () => console.log('연결 종료'));

      _protoo.current.on('request', async (request: any, accept: () => void) => {
        console.log('Protoo 요청:', request);
        if (request.method === 'newConsumer') {
          const consumer = await _recvTransport.current.consume(request.data);
          _consumers.set(consumer.id, consumer);

          console.log(`새로운 Consumer 생성: ${consumer.kind} - ID: ${consumer.id}`);

          if (consumer.kind === 'video' && remoteVideoRef.current) {
            const remoteStream = new MediaStream([consumer.track]);
            remoteVideoRef.current.srcObject = remoteStream;
          }

          consumer.on('transportclose', () => {
            _consumers.delete(consumer.id);
          });

          accept();
        }
      });

      _protoo.current.on('notification', (notification: any) => {
        console.log('Protoo 알림:', notification);

        switch (notification.method) {
          case 'newPeer': {
            const peer = notification.data;
            addPeer({
              id: peer.id,
              displayName: peer.displayName,
              consumers: [],
            });
            break;
          }
          case 'peerClosed': {
            const peer = notification.data;
            removePeer(peer.id);
            break;
          }
          case 'activeSpeaker': {
            const { peerId } = notification.data;
            setActiveSpeakerId(peerId);
            break;
          }
        }
      });

      console.log('=== 모든 테스트 완료 ===');
    } catch (error) {
      console.error('테스트 중 오류 발생:', error);
    }
  };

  const joinRoom = async () => {
    try {
      _mediasoupDevice.current = new mediasoupClient.Device();
      const routerRtpCapabilities = await _protoo.current.request('getRouterRtpCapabilities');
      await _mediasoupDevice.current.load({
        routerRtpCapabilities,
      });

      setMe({
        peerId: _protoo.current._id || '',
        displayName: '테스트유저',
        device: _mediasoupDevice.current, // or use a device info object if available
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
            if (kind === 'audio' || kind === 'video') {
              setMediaCapabilities({
                canSendMic: true,
                canSendWebcam: true,
              });
            }
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
        displayName: '테스트유저',
        device: 'browser',
      });
      console.log('방 참여 성공:', peers);
      setRoomState('connected');

      enableAudio();
      enableVideo();
    } catch (error) {
      console.error('방 참여 중 오류 발생:', error);
    }
  };

  const enableAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      console.log('오디오 트랙:', audioTrack);
      const audioProducer = await _sendTransport.current.produce({ track: audioTrack });
      console.log('Producer 객체:', audioProducer);
      addProducer({
        id: audioProducer.id,
        track: audioTrack,
        paused: audioProducer.paused,
      });
    } catch (error) {
      console.error('마이크 활성화 중 오류 발생:', error);
    }
  };

  const enableVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      console.log('비디오 트랙:', videoTrack);
      const videoProducer = await _sendTransport.current.produce({ track: videoTrack });
      console.log('Producer 객체:', videoProducer);
      addProducer({
        id: videoProducer.id,
        track: videoTrack,
        paused: videoProducer.paused,
      });
    } catch (error) {
      console.error('비디오 활성화 중 오류 발생:', error);
    }
  };

  // const pauseAudio = async () => {
  //   try {
  //     const audioProducer = _sendTransport.current.producers.find((p: any) => p.kind === 'audio');
  //     if (audioProducer) {
  //       await audioProducer.pause();
  //       setAudioMutedState(true);
  //       setProducerPaused(audioProducer.id);
  //       console.log('오디오 비활성화 성공');
  //     }
  //   } catch (error) {
  //     console.error('오디오 비활성화 중 오류 발생:', error);
  //   }
  // };

  // const pauseVideo = async () => {
  //   try {
  //     const videoProducer = _sendTransport.current.producers.find((p: any) => p.kind === 'video');
  //     if (videoProducer) {
  //       await videoProducer.pause();
  //       setVideoMutedState(true);
  //       setProducerPaused(videoProducer.id);
  //       console.log('비디오 비활성화 성공');
  //     }
  //   } catch (error) {
  //     console.error('비디오 비활성화 중 오류 발생:', error);
  //   }
  // };

  // const resumeAudio = async () => {
  //   const audioProducer = _sendTransport.current.producers.find((p: any) => p.kind === 'audio');
  //   if (audioProducer) {
  //     await audioProducer.resume();
  //     setProducerResumed(audioProducer.id);
  //     setAudioMutedState(false);
  //     console.log('오디오 재개 성공');
  //   }
  // };

  // const resumeVideo = async () => {
  //   const videoProducer = _sendTransport.current.producers.find((p: any) => p.kind === 'video');
  //   if (videoProducer) {
  //     await videoProducer.resume();
  //     setProducerResumed(videoProducer.id);
  //     setVideoMutedState(false);
  //     console.log('비디오 재개 성공');
  //   }
  // };

  const close = () => {
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
      _consumers.clear();
      setRoomState('closed');
      resetOnRoomClosed();
      resetProducers();
      console.log('연결 해제 완료');
    } catch (e) {
      console.error('연결 해제 중 오류:', e);
    }
  };

  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  return (
    <div className="flex flex-col p-6 gap-5">
      <div className="flex gap-5">
        <SquareBtn onClick={join} text={'peer 생성'} template={'filled'} width="w-full" />
        <SquareBtn onClick={close} text={'연결 해제'} template={'filled'} width="w-full" />
      </div>

      <div className="mt-6 flex gap-6">
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: 320, height: 240, background: '#222' }}
          />
        </div>
        <div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: 320, height: 240, background: '#222' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TestPage;
