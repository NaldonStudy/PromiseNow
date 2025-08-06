import { useState, useEffect, useCallback } from 'react';
import LocationList from './LocationList';

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string; // longitude
  y: string; // latitude
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LocationInput = ({ value, onChange, placeholder = '검색어' }: LocationInputProps) => {
  const [locations, setLocations] = useState<Array<{ id: string; name: string; address: string }>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    const checkKakaoReady = () => {
      if (window.kakao?.maps?.services?.Places && window.kakao?.maps?.services?.Status) {
        setKakaoReady(true);
      } else {
        setTimeout(checkKakaoReady, 1000);
      }
    };

    checkKakaoReady();
  }, []);

  // 카카오 장소 검색 함수
  const searchPlaces = useCallback(
    (keyword: string) => {
      if (!keyword.trim()) {
        setLocations([]);
        return;
      }

      if (!window.kakao?.maps?.services) {
        setLocations([]);
        return;
      }

      setIsLoading(true);

      try {
        const places = new window.kakao.maps.services.Places();

        places.keywordSearch(keyword, (result: KakaoPlace[], status: string) => {
          setIsLoading(false);

          if (status === window.kakao.maps.services.Status.OK) {
            const formattedLocations = result.slice(0, 10).map((place) => ({
              id: place.id,
              name: place.place_name,
              address: place.road_address_name || place.address_name,
            }));
            setLocations(formattedLocations);
          } else {
            setLocations([]);
          }
        });
      } catch (error) {
        console.error('💥 검색 중 오류 발생:', error);
        setIsLoading(false);
        setLocations([]);
      }
    },
    [kakaoReady],
  );

  // 검색어 변경 시 디바운싱된 검색 실행
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim() && kakaoReady) {
        searchPlaces(value);
      } else {
        setLocations([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, searchPlaces, kakaoReady]);

  const handleLocationSelect = (location: { id: string; name: string; address: string }) => {
    onChange(location.name);
    setLocations([]);
  };

  return (
    <>
      <div className="flex items-center">
        <label className="w-15 block text-text-dark">장소</label>
        <div className="relative w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={kakaoReady ? placeholder : '카카오 맵 로딩 중...'}
            disabled={!kakaoReady}
            className={`w-full px-4 py-3 bg-gray border border-gray-dark rounded-lg ${
              !kakaoReady ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
          {!kakaoReady && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-pulse text-sm text-text-dark">대기중</div>
            </div>
          )}
        </div>
      </div>
      {!kakaoReady && (
        <div className="text-sm text-text-dark mt-1">
          카카오 맵 API를 로딩하고 있습니다. 잠시만 기다려주세요.
        </div>
      )}
      {locations.length > 0 && (
        <LocationList locations={locations} onLocationSelect={handleLocationSelect} />
      )}
    </>
  );
};

export default LocationInput;
