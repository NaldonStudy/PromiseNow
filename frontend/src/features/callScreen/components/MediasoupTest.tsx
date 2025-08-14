import { useState } from 'react';
import { useMediasoupClient } from '../../../hooks/webrtc/useMediasoupClient';

const MediasoupTest = () => {
  const [roomId, setRoomId] = useState('test1');
  const [displayName, setDisplayName] = useState('Anonymous');

  const {
    isConnected,
    isConnecting,
    error,
    localStream,
    remoteStreams,
    micProducer,
    webcamProducer,
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
  } = useMediasoupClient({
    roomId,
    displayName,
    produce: true,
    consume: true,
    mic: true,
    webcam: true,
  });

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mediasoup 클라이언트 테스트</h1>
      
      {/* Connection Controls */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">연결 설정</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">방 ID:</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이름:</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            disabled={isConnecting || isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            {isConnecting ? '연결 중...' : '연결'}
          </button>
          <button
            onClick={handleDisconnect}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            연결 해제
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">상태</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>연결 상태:</strong> {isConnected ? '연결됨' : '연결 안됨'}</p>
            <p><strong>마이크:</strong> {micProducer ? (micProducer.paused ? '음소거' : '활성') : '비활성'}</p>
            <p><strong>웹캠:</strong> {webcamProducer ? (webcamProducer.paused ? '비활성' : '활성') : '비활성'}</p>
          </div>
          <div>
            <p><strong>원격 스트림:</strong> {remoteStreams.size}개</p>
            <p><strong>로컬 스트림:</strong> {localStream ? '활성' : '비활성'}</p>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>오류:</strong> {error}
          </div>
        )}
      </div>

      {/* Media Controls */}
      {isConnected && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">미디어 제어</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={enableMic}
              disabled={!!micProducer}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
            >
              마이크 활성화
            </button>
            <button
              onClick={disableMic}
              disabled={!micProducer}
              className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
            >
              마이크 비활성화
            </button>
            <button
              onClick={micProducer?.paused ? unmuteMic : muteMic}
              disabled={!micProducer}
              className="px-4 py-2 bg-orange-500 text-white rounded disabled:bg-gray-400"
            >
              {micProducer?.paused ? '음소거 해제' : '음소거'}
            </button>
            <button
              onClick={enableWebcam}
              disabled={!!webcamProducer}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
            >
              웹캠 활성화
            </button>
            <button
              onClick={disableWebcam}
              disabled={!webcamProducer}
              className="px-4 py-2 bg-yellow-500 text-white rounded disabled:bg-gray-400"
            >
              웹캠 비활성화
            </button>
            <button
              onClick={webcamProducer?.paused ? unmuteWebcam : muteWebcam}
              disabled={!webcamProducer}
              className="px-4 py-2 bg-orange-500 text-white rounded disabled:bg-gray-400"
            >
              {webcamProducer?.paused ? '비디오 활성화' : '비디오 비활성화'}
            </button>
          </div>
        </div>
      )}

      {/* Video Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        {localStream && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">로컬 비디오</h3>
            <video
              ref={(video) => {
                if (video) video.srcObject = localStream;
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}

        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
          <div key={peerId} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">원격 비디오 ({peerId.slice(0, 8)})</h3>
            <video
              ref={(video) => {
                if (video) video.srcObject = stream;
              }}
              autoPlay
              playsInline
              className="w-full h-48 object-cover rounded"
            />
          </div>
        ))}
      </div>

      {/* Debug Info */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">디버그 정보</h2>
        <div className="text-sm">
          <p><strong>서버 URL:</strong> wss://webrtc.promisenow.store:4443</p>
          <p><strong>방 ID:</strong> {roomId}</p>
          <p><strong>참가자 ID:</strong> {displayName}</p>
          <p><strong>연결 상태:</strong> {isConnected ? '연결됨' : '연결 안됨'}</p>
          <p><strong>로딩 상태:</strong> {isConnecting ? '연결 중' : '대기 중'}</p>
        </div>
      </div>
    </div>
  );
};

export default MediasoupTest;
