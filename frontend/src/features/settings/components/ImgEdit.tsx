import { useState } from 'react';
import { useParams } from 'react-router-dom';

import CircleBtn from '../../../components/ui/CircleBtn';
import Profile from '../../../components/ui/Profile';
import ImgPopCard from './ImgPopCard';

import { useUpdateProfileImage } from '../../../hooks/queries/room';
import { useInvalidateRoomQueries } from '../../../hooks/queries/room/keys';

import { useRoomStore } from '../../../stores/room.store';
import { useUserStore } from '../../../stores/user.store';

const ImgEdit = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { profileImageUrl, setProfileImageUrl } = useRoomStore();
  const { userId } = useUserStore();
  const { id } = useParams();
  const roomId = Number(id);

  const { invalidateRoom } = useInvalidateRoomQueries();
  const { mutateAsync: updateImage } = useUpdateProfileImage();

  // 파일 업로드 선택 시
  const handleUpload = async (file: File) => {
    if (!roomId || userId == null) {
      alert('방 또는 사용자 정보가 없습니다.');
      return;
    }
    try {
      setUploading(true);
      const response = await updateImage({ roomId, userId, file });
      if (response && response.imageUrl) {
        setProfileImageUrl(response.imageUrl); // 스토어 갱신
        invalidateRoom({ roomId, userId }); // 관련 쿼리 무효화
      } else {
        alert('이미지 업로드 응답에 imageUrl이 없습니다.');
      }
    } catch (e) {
      console.error(e);
      alert('프로필 이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  // 기본 이미지로 변경
  const handleReset = () => {
    // 서버에도 리셋 API가 있다면 여기서 호출하도록 확장
    setProfileImageUrl(null);
    if (roomId && userId != null) {
      invalidateRoom({ roomId, userId });
    }
  };

  return (
    <div className="relative w-fit">
      <Profile width="w-15" imgUrl={profileImageUrl} iconSize={28} />

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
