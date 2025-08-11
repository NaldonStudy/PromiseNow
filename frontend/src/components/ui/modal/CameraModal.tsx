// src/features/chat/components/CameraModal.tsx
import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onShot: (file: File) => void;
};

const CameraModal = ({ open, onClose, onShot }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        onClose();
      }
    };
    start();
    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setReady(false);
    };
  }, [open, onClose]);

  const handleShot = async () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise(
      (res) => canvas.toBlob((b) => res(b as Blob), 'image/jpeg', 0.92)!,
    );
    const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
    onShot(file);
    onClose();
  };

  if (!open) return null;

  // CameraModal.tsx 수정
  return open ? (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* 비디오: 화면 꽉 채우기 */}
      <video ref={videoRef} playsInline autoPlay muted className="flex-1 w-full object-cover" />

      {/* 하단 버튼 영역 */}
      <div className="absolute bottom-0 left-0 w-full p-4 flex gap-3 bg-black/50">
        <button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl border border-gray-300 text-white"
        >
          닫기
        </button>
        <button
          onClick={handleShot}
          disabled={!ready}
          className="flex-1 h-12 rounded-xl bg-primary text-white disabled:opacity-50"
        >
          촬영
        </button>
      </div>
    </div>
  ) : null;
};

export default CameraModal;
