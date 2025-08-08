// 브라우저 API 확장 타입 정의
declare global {
  interface Window {
    webkitRTCPeerConnection?: typeof RTCPeerConnection;
    mozRTCPeerConnection?: typeof RTCPeerConnection;
    RTCDataChannel?: typeof RTCDataChannel;
  }
}

// 브라우저 정보 타입 정의
export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
}

// 미디어 디바이스 정보 타입 정의
export interface PermissionStatus {
  camera: 'granted' | 'denied' | 'prompt';
  microphone: 'granted' | 'denied' | 'prompt';
}
