import { useState } from 'react';
import { useParams } from 'react-router-dom';

import CircleBtn from '../../components/ui/CircleBtn';
import ModalForm from '../../components/ui/modal/ModalForm';
import Profile from '../../components/ui/Profile';
import { useInvalidateRoomQueries } from '../../hooks/queries/room/keys';
import { useRoomStore } from '../../stores/room.store';
import { useUserStore } from '../../stores/user.store';

const ImgEdit = () => {
  const [isModal, setIsModal] = useState(false);
  const { profileImageUrl, setProfileImageUrl } = useRoomStore();
  const { userId } = useUserStore();
  const { id } = useParams();
  const roomId = Number(id);
  const { invalidateRoom } = useInvalidateRoomQueries();

  const handleImageUpload = (input: string) => {
    setProfileImageUrl(input);

    if (roomId && userId != null) {
      invalidateRoom({ roomId, userId });
    }
  };

  const handleResetImage = () => {
    setProfileImageUrl(null);
    setIsModal(false);

    if (roomId && userId != null) {
      invalidateRoom({ roomId, userId });
    }
  };

  return (
    <div className="relative w-fit">
      <Profile width="w-15" imgUrl={profileImageUrl} iconSize={28} />

      <div className="absolute -bottom-2 -right-2">
        <CircleBtn iconType="edit" color="primary" iconSize={15} onClick={() => setIsModal(true)} />
      </div>

      {isModal && (
        <ModalForm
          isOpen={isModal}
          onClose={() => setIsModal(false)}
          title="프로필 이미지 변경"
          placeholder="ex) https://image.com/me.png"
          submitText="변경하기"
          onSubmit={(value) => {
            handleImageUpload(value);
            setIsModal(false);
          }}
          secondBtn={true}
          onSecondBtnClick={handleResetImage}
          secondBtnText="기본 이미지로 변경"
        />
      )}
    </div>
  );
};

export default ImgEdit;
