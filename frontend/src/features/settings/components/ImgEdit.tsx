import { useState } from 'react';
import profileImg from '../../../assets/images/profileImg.png';

import CircleBtn from '../../../components/ui/CircleBtn';
import Profile from '../../../components/ui/Profile';
import ImgPopCard from './ImgPopCard';

interface Props {
  imageUrl?: string | null;
  onImageUpdate: (file: File) => void;
}

const ImgEdit = ({ imageUrl, onImageUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 파일 업로드 선택 시
  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await onImageUpdate(file);
    } catch (e) {
      console.error(e);
      alert('프로필 이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  // 기본 이미지로 변경
  const handleReset = async () => {
    const response = await fetch(profileImg);
    const blob = await response.blob();
    const file = new File([blob], 'default.png', { type: blob.type });
    onImageUpdate(file);
  };

  return (
    <div className="relative w-fit">
      <Profile width="w-15" imgUrl={imageUrl} iconSize={28} />

      <div className="absolute -bottom-2 -right-2">
        <CircleBtn
          iconType="edit"
          color="primary"
          iconSize={15}
          onClick={() => setOpen((v) => !v)}
          disabled={uploading}
        />
      </div>

      {open && (
        <ImgPopCard
          onUpload={handleUpload}
          onReset={handleReset}
          onClose={() => setOpen(false)}
          disabled={uploading}
        />
      )}
    </div>
  );
};

export default ImgEdit;
