// src/features/chat/components/CameraPopCard.tsx
import { useEffect, useRef, useState } from 'react';
import SquareBtn from '../../../components/ui/SquareBtn';
import CameraModal from '../../../components/ui/modal/CameraModal.tsx';

type Props = {
  onSelect: (file: File) => void;
  onClose: () => void;
  disabled?: boolean;
  className?: string;
};

const CameraPopCard = ({ onSelect, onClose, disabled, className }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [openCamera, setOpenCamera] = useState(false);

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = e.target as Node;
      if (!el.contains(target)) onClose();
    };
    document.addEventListener('touchstart', handleTouch, true);
    return () => document.removeEventListener('touchstart', handleTouch, true);
  }, [onClose]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!f) return;
    onSelect(f);
    onClose();
  };

  return (
    <>
      <div
        ref={rootRef}
        className={`absolute bottom-full mb-2 left-0 z-50 w-44 rounded-2xl border border-gray-dark bg-white p-2 ${
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
          onClick={() => setOpenCamera(true)}
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
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <CameraModal
        open={openCamera}
        onClose={() => setOpenCamera(false)}
        onShot={(file) => onSelect(file)}
      />
    </>
  );
};

export default CameraPopCard;
