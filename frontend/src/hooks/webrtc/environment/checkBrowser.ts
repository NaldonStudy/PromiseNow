import type { BrowserInfo } from './environment.types';

export function checkBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  let isSupported = false;

  // Chrome 확인
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 74;
  }
  // Firefox 확인
  else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 67;
  }
  // Safari 확인
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 12;
  }
  // Edge 확인
  else if (userAgent.includes('Edg')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    isSupported = parseInt(version) >= 79;
  }

  // WebRTC 지원 확인
  const webrtcSupport = () => {
    const hasRTCPeerConnection = !!(
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    );

    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasRTCDataChannel = !!window.RTCDataChannel;
    return hasRTCPeerConnection && hasGetUserMedia && hasRTCDataChannel;
  };
  isSupported = isSupported && webrtcSupport();

  return {
    name,
    version,
    isSupported,
  };
}
