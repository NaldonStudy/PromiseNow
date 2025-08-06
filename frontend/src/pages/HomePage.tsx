import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { dummy } from '../features/rooms/dummy';
import HomeTemplate from './templates/HomeTemplate';
import { useJoinedRooms } from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';

const HomePage = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useUserStore();
  const { data: rooms } = useJoinedRooms(userId!);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/');
    }
  }, [isAuthenticated, userId, navigate]);

  if (!isAuthenticated || !userId) {
    return <div>로딩 중...</div>;
  }

  return <HomeTemplate rooms={rooms || dummy} />;
};

export default HomePage;
