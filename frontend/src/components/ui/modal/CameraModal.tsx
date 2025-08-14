// src/features/chat/components/CameraModal.tsx
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onShot: (file: File) => void;
};

const CameraModal = ({ open, onClose, onShot }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const triedDeviceFallbackRef = useRef<boolean>(false);

  const [ready, setReady] = useState(false);
  const [needGesture, setNeedGesture] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- helpers (stable) ---
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const formatErr = useCallback((e: unknown): string => {
    if (e instanceof DOMException) return e.message ? `${e.name}: ${e.message}` : e.name;
    if (e instanceof Error) return e.message;
    return 'Unknown error';
  }, []);

  const getStreamGeneric = useCallback(async (): Promise<MediaStream> => {
    const trials: MediaStreamConstraints[] = [
      { video: { facingMode: { exact: 'environment' } }, audio: false },
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      { video: { facingMode: { ideal: 'user' } }, audio: false },
      { video: true, audio: false },
    ];
    for (const c of trials) {
      try {
        return await navigator.mediaDevices.getUserMedia(c);
      } catch {
        // try next
      }
    }
    throw new Error('getUserMedia failed');
  }, []);

  // startWithSpecificDevice를 ref로 참조해 순환 의존 방지
  const startWithSpecificDeviceRef = useRef<null | (() => Promise<void>)>(null);

  const attachAndPlay = useCallback(async (stream: MediaStream) => {
    const v = videoRef.current;
    if (!v) return;

    v.srcObject = stream;
    v.setAttribute('playsinline', 'true');
    v.muted = true;

    const onMeta = () => setReady(true);
    v.addEventListener('loadedmetadata', onMeta, { once: true });

    try {
      await v.play();
      setNeedGesture(false);
    } catch {
      setNeedGesture(true);
    }

    // 메타가 안 뜨는 일부 기기 대응: 잠시 후 비디오 폭이 0이면 특정 디바이스로 재시도
    window.setTimeout(async () => {
      const el = videoRef.current;
      if (!el) return;
      const w = el.videoWidth ?? 0;
      if (w === 0 && !triedDeviceFallbackRef.current) {
        triedDeviceFallbackRef.current = true;
        await startWithSpecificDeviceRef.current?.();
      }
    }, 1200);
  }, []);

  const startWithSpecificDevice = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      const target = cams[0];
      if (!target) throw new Error('No video input device');

      const s = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: target.deviceId } },
        audio: false,
      });
      stop();
      streamRef.current = s;
      await attachAndPlay(s);
    } catch (e: unknown) {
      setError(formatErr(e));
    }
  }, [attachAndPlay, formatErr, stop]);

  // ref 최신화
  useEffect(() => {
    startWithSpecificDeviceRef.current = startWithSpecificDevice;
  }, [startWithSpecificDevice]);

  const start = useCallback(async () => {
    setError(null);
    setNeedGesture(false);
    setReady(false);
    triedDeviceFallbackRef.current = false;

    try {
      const s = await getStreamGeneric();
      stop();
      streamRef.current = s;
      await attachAndPlay(s);
    } catch (e: unknown) {
      setError(formatErr(e));
    }
  }, [attachAndPlay, formatErr, getStreamGeneric, stop]);

  // --- effects ---
  useEffect(() => {
    if (!open) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('getUserMedia not supported');
      return;
    }
    let active = true;
    (async () => {
      if (!active) return;
      await start();
    })();

    return () => {
      active = false;
      stop();
    };
  }, [open, start, stop]);

  const resumePlay = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      await v.play();
      setNeedGesture(false);
    } catch (e: unknown) {
      setError(formatErr(e));
    }
  }, [formatErr]);

  const handleShot = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;

    const w = v.videoWidth || 720;
    const h = v.videoHeight || 1280;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        0.92,
      );
    });

    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
    onShot(file);
    onClose();
  }, [onClose, onShot]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="w-full max-w-mobile px-4">
        <div className="relative w-full h-[65dvh] max-h-[720px] rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {!ready && !needGesture && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white text-xs">
              <div className="text-primary text-4xl">📷</div>
              카메라를 여는 중…
            </div>
          )}

          {needGesture && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={resumePlay}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm shadow"
              >
                카메라 시작
              </button>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
              <div className="text-sm">카메라를 시작할 수 없습니다.</div>
              <div className="text-xs opacity-70">{error}</div>
              <button
                onClick={start}
                className="mt-2 px-3 py-2 rounded-lg bg-white/10 text-xs border border-white/30"
              >
                다시 시도
              </button>
            </div>
          )}

          <div className="absolute left-0 right-0 bottom-3 px-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="h-12 rounded-xl border border-gray-300 text-white"
              >
                닫기
              </button>
              <button
                onClick={handleShot}
                disabled={!ready}
                className="h-12 rounded-xl bg-primary text-white disabled:opacity-50"
              >
                촬영
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
