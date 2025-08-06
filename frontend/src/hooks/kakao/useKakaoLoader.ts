import { useEffect } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

let isKakaoLoaded = false;

export const useKakaoLoader = () => {
  useEffect(() => {
    if (isKakaoLoaded || window.kakao) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=d237e8e1648c27e6631635f056ccc121&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        isKakaoLoaded = true;
        console.log('✅ Kakao Map SDK loaded with services library');
        console.log('📍 Services available:', !!window.kakao?.maps?.services);
      });
    };

    document.head.appendChild(script);
  }, []);
};
