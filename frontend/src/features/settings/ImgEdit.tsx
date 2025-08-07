import { useState } from 'react';

import CircleBtn from '../../components/ui/CircleBtn';
import ModalForm from '../../components/ui/modal/ModalForm';
import Profile from '../../components/ui/Profile';
import { useRoomStore } from '../../stores/room.store';

const ImgEdit = () => {
  const [isModal, setIsModal] = useState(false);
  const { profileImageUrl, setProfileImageUrl } = useRoomStore();

  const handleImageUpload = (input: string) => {
    setProfileImageUrl(input);
  };

  const handleResetImage = () => {
    setProfileImageUrl(null);
    setIsModal(false);
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
