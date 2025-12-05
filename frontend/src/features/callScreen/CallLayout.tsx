import { Outlet, useParams } from 'react-router-dom';
import { CallSessionProvider } from '../../hooks/webrtc/useCallSession';
import { useUserStore } from '../../stores/user.store';
import GlobalAudioHub from './AudioHub';

export default function CallLayout() {
  const { id: routeRoomId } = useParams();
  const { user } = useUserStore();

  if (!routeRoomId) return null;

  return (
    <CallSessionProvider key={routeRoomId} roomId={routeRoomId} userId={user?.userId?.toString()}>
      <GlobalAudioHub />
      <Outlet />
    </CallSessionProvider>
  );
}
