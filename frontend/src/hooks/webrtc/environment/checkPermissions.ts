import type { PermissionStatus } from './environment.types';

// 요청 권한 확인
export async function checkPermissions(): Promise<PermissionStatus> {
  if ('permissions' in navigator) {
    const [cameraPermission, microphonePermission] = await Promise.all([
      navigator.permissions.query({ name: 'camera' as PermissionName }),
      navigator.permissions.query({ name: 'microphone' as PermissionName }),
    ]);

    return {
      camera: cameraPermission.state,
      microphone: microphonePermission.state,
    };
  }

  return requestMediaPermissions();
}

// 미디어 장치 권한 요청
export async function requestMediaPermissions(): Promise<PermissionStatus> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach((track) => track.stop());

    return {
      camera: 'granted',
      microphone: 'granted',
    };
  } catch (error) {
    // 권한 API로 개별 확인 시도
    if ('permissions' in navigator) {
      try {
        const [cameraPermission, microphonePermission] = await Promise.all([
          navigator.permissions.query({ name: 'camera' as PermissionName }),
          navigator.permissions.query({ name: 'microphone' as PermissionName }),
        ]);

        return {
          camera: cameraPermission.state,
          microphone: microphonePermission.state,
        };
      } catch {
        // 권한 API 사용 불가능한 경우
        return {
          camera: 'prompt',
          microphone: 'prompt',
        };
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
      return {
        camera: 'denied',
        microphone: 'denied',
      };
    }

    return {
      camera: 'prompt',
      microphone: 'prompt',
    };
  }
}
