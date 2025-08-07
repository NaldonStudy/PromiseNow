import { useEffect, useState } from 'react';
import ToggleBtn from './ToggleBtn';

import { useParams } from 'react-router-dom';
import { getAlarmSetting, updateAlarmSetting } from '../../apis/room/roomuser.api';
import { useUserStore } from '../../stores/user.store';

const Notification = () => {
  const { id } = useParams();
  const roomId = Number(id);
  const { userId } = useUserStore();

  const [isAgreed, setIsAgreed] = useState<boolean | null>(null);

  console.log('🔍 [Notification Render]');
  console.log('userId:', userId);
  console.log('roomId:', roomId);
  console.log('isAgreed:', isAgreed);

  useEffect(() => {
    const fetchAlarmSetting = async () => {
      if (userId == null || !roomId) {
        console.log('⛔ 조건 미충족: userId or roomId null');
        return;
      }

      try {
        console.log('📡 fetching alarm setting...');
        const res = await getAlarmSetting(roomId, userId);
        if (!res) {
          console.log('⚠️ getAlarmSetting returned null');
          return;
        }

        console.log('✅ 알림 상태 도착:', res.isAgreed);
        setIsAgreed(res.isAgreed ?? true); // fallback to true
      } catch (error) {
        console.error('❌ 알림 상태 불러오기 실패:', error);
      }
    };

    fetchAlarmSetting();
  }, [roomId, userId]);

  const handleToggle = async (checked: boolean) => {
    if (userId == null || !roomId) return;

    try {
      console.log('🔁 알림 설정 변경 요청:', checked);
      await updateAlarmSetting(roomId, userId, { isAgreed: checked });
      setIsAgreed(checked);
    } catch (error) {
      console.error('❌ 알림 설정 실패:', error);
    }
  };

  if (userId == null || !roomId || isAgreed === null) {
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
