// src/types/sockjs-client.d.ts

declare module 'sockjs-client' {
  class SockJS {
    constructor(url: string, protocols?: string[], options?: string);

    onopen: () => void;
    onclose: () => void;
    onmessage: (e: { data: string }) => void;

    send(data: string): void;
    close(code?: number, reason?: string): void;

    // 내부적으로 사용하는 속성들 (선택)
    _transport?: {
      url?: string;
    };
  }

  export default SockJS;
}
