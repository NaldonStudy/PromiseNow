import { useEffect, useRef } from 'react';
import SquareBtn from '../../../components/ui/SquareBtn';

type Props = {
  onUpload: (file: File) => void; // 파일 업로드 선택
  onReset: () => void; // 기본 이미지로 변경
  onClose: () => void;
  disabled?: boolean;
  className?: string;
};

const ImgPopCard = ({ onUpload, onReset, onClose, disabled, className }: Props) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 모바일: 바깥 터치 시 닫힘
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };
    document.addEventListener('touchstart', handleTouch, true);
    return () => document.removeEventListener('touchstart', handleTouch, true);
  }, [onClose]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    e.target.value = '';
    if (!f) return;
    onUpload(f);
    onClose();
  };

  return (
    <div
      ref={rootRef}
      className={`absolute mb-2 left-5 z-50 w-48 rounded-2xl border border-gray-dark bg-white p-2 ${
        className ?? ''
      }`}
      role="dialog"
      onClick={(e) => e.stopPropagation()}
    >
      <SquareBtn
        text="기본 이미지로 변경"
        template="outlined"
        width="w-full"
        height="h-10"
        textSize="text-sm"
        disabled={disabled}
        onClick={() => {
          if (!disabled) onReset();
          onClose();
        }}
        className="mb-1"
      />

      <SquareBtn
        text="이미지 업로드"
        template="filled"
        width="w-full"
        height="h-10"
        textSize="text-sm"
        disabled={disabled}
        onClick={() => fileRef.current?.click()}
      />

      {/* 숨겨진 파일 인풋 */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ImgPopCard;
