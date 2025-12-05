import { useState } from 'react';
import { checkBrowser } from './checkBrowser';
import { checkPermissions, requestMediaPermissions } from './checkPermissions';

type BrowserInfo = Awaited<ReturnType<typeof checkBrowser>>;

type EnvironmentStatus = {
  isChecking: boolean;
  isReady: boolean;
  errors: string[];
  browser: BrowserInfo | null;
  permissions: {
    camera: string;
    microphone: string;
  };
};

export const useEnvironmentCheck = () => {
  const [status, setStatus] = useState<EnvironmentStatus>({
    isChecking: false,
    isReady: false,
    errors: [],
    browser: null,
    permissions: {
      camera: 'unknown',
      microphone: 'unknown',
    },
  });

  const runEnvironmentCheck = async () => {
    setStatus((prev) => ({ ...prev, isChecking: true, errors: [] }));

    try {
      // 브라우저 확인 (동기 함수)
      const browserInfo = checkBrowser();
      setStatus((prev) => ({ ...prev, browser: browserInfo }));

      // 권한 확인
      const permissions = await checkPermissions();
      setStatus((prev) => ({ ...prev, permissions }));

      // 최종 상태 업데이트
      const finalStatus = {
        isChecking: false,
        isReady:
          browserInfo.isSupported &&
          permissions.camera === 'granted' &&
          permissions.microphone === 'granted',
        errors: [],
        browser: browserInfo,
        permissions,
      };

      setStatus((prev) => ({
        ...prev,
        ...finalStatus,
      }));

      // 결과 반환
      return {
        browser: browserInfo,
        permissions,
        isReady: finalStatus.isReady,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setStatus((prev) => ({
        ...prev,
        isChecking: false,
        errors: [errorMsg],
      }));

      throw error;
    }
  };

  // 실제 권한 요청 함수
  const requestPermissions = async () => {
    setStatus((prev) => ({ ...prev, isChecking: true, errors: [] }));

    try {
      const permissions = await requestMediaPermissions();
      setStatus((prev) => ({
        ...prev,
        permissions,
        isChecking: false,
        isReady:
          (prev.browser?.isSupported ?? false) &&
          permissions.camera === 'granted' &&
          permissions.microphone === 'granted',
      }));

      return permissions;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Permission request failed';
      setStatus((prev) => ({
        ...prev,
        isChecking: false,
        errors: [errorMsg],
      }));

      throw error;
    }
  };

  return {
    status,
    runEnvironmentCheck,
    requestPermissions,
  };
};
