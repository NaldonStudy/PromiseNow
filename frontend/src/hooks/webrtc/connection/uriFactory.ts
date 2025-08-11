// URLSearchParams를 사용한 query string 생성 함수
function stringify(obj: Record<string, unknown>): string {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });

  return params.toString();
}

let protooPort: number = 4443;
let hostname: string = window.location.hostname;

if (window.location.hostname === 'test.mediasoup.org') {
  protooPort = 4444;
}

// EC2 SFU 서버 연결 (로컬 React 앱에서)
if (window.location.hostname === 'localhost') {
  protooPort = 443;
  hostname = 'webrtc.promisenow.store';
}

const protocol: string = 'wss';

export function getProtooUrl(params: Record<string, unknown>): string {
  const query = stringify(params);

  // EC2 SFU 서버 연결
  if (hostname === 'webrtc.promisenow.store') {
    return `${protocol}://${hostname}/ws/?${query}`;
  }

  return `${protocol}://${hostname}:${protooPort}/?${query}`;
}
