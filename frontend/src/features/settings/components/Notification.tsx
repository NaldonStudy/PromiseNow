import { useEffect, useState } from 'react';
import ToggleBtn from './ToggleBtn';

import { useParams } from 'react-router-dom';
import { getAlarmSetting, updateAlarmSetting } from './../../../apis/room/roomuser.api';
import { useUserStore } from './../../../stores/user.store';

const Notification = () => {
  const { id } = useParams();
  const roomId = Number(id);
  const { user } = useUserStore();

  const [isAgreed, setIsAgreed] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchAlarmSetting = async () => {
      if (!user?.userId || !roomId) {
        console.log('⛔ 조건 미충족: userId or roomId null');
        return;
      }

      try {
        const res = await getAlarmSetting(roomId, user.userId);
        if (!res) {
          console.log('⚠️ getAlarmSetting returned null');
          return;
        }

        setIsAgreed(res.isAgreed ?? true); // fallback to true
      } catch (error) {
        console.error('❌ 알림 상태 불러오기 실패:', error);
      }
    };

    fetchAlarmSetting();
  }, [roomId, user?.userId]);

  const handleToggle = async (checked: boolean) => {
    if (!user?.userId || !roomId) return;

    try {
      await updateAlarmSetting(roomId, user.userId, { isAgreed: checked });
      setIsAgreed(checked);
    } catch (error) {
      console.error('❌ 알림 설정 실패:', error);
    }
  };

  if (!user?.userId || !roomId || isAgreed === null) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-5 py-5 border-b border-gray-dark">
      <span className="text-lg">알림설정</span>
      <ToggleBtn isOn={isAgreed} onToggle={handleToggle} />
    </div>
  );
};

export default Notification;
