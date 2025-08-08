// src/features/chat/components/CameraPopCard.tsx
import { useEffect, useRef } from 'react';
import SquareBtn from '../../../components/ui/SquareBtn';

type Props = {
  onSelect: (file: File) => void;
  onClose: () => void;
  disabled?: boolean;
  className?: string;
};

const CameraPopCard = ({ onSelect, onClose, disabled, className }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = e.target as Node;
      if (!el.contains(target)) onClose();
    };

    document.addEventListener('touchstart', handleTouch, true);

    return () => {
      document.removeEventListener('touchstart', handleTouch, true);
    };
  }, [onClose]);

  const commonChange = (clear: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    clear(''); // 같은 파일 재선택 허용
    if (!f) return;
    onSelect(f);
    onClose();
  };

  return (
    <div
      ref={rootRef}
      className={`absolute bottom-full mb-2 left-0 z-50 w-44 rounded-2xl shadow-md border bg-white p-2 ${
        className ?? ''
      }`}
      role="dialog"
      onClick={(e) => e.stopPropagation()}
    >
      <SquareBtn
        text="사진 촬영"
        template="outlined"
        width="w-full"
        height="h-10"
        textSize="text-sm"
        disabled={disabled}
        onClick={() => captureRef.current?.click()}
        className="mb-1"
      />

      <SquareBtn
        text="이미지 업로드"
        template="filled"
        width="w-full"
        height="h-10"
        textSize="text-sm"
        disabled={disabled}
        onClick={() => galleryRef.current?.click()}
      />

      <input
        ref={captureRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={commonChange((v) => (captureRef.current!.value = v))}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={commonChange((v) => (galleryRef.current!.value = v))}
      />
    </div>
  );
};

export default CameraPopCard;
