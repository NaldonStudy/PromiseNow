/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';
import { useMediasoupClient } from './useMediasoupClient';
import { useCallActionStore } from '../../features/callScreen/callAction';
import { useNavigate } from 'react-router-dom';

type Props = {
  roomId: string;
  userId?: string;
  displayName?: string;
  children: React.ReactNode;
};

const Ctx = createContext<ReturnType<typeof useMediasoupClient> | null>(null);

export function CallSessionProvider({ roomId, userId, children }: Props) {
  const client = useMediasoupClient({
    roomId,
    userId: userId ?? '',
    produce: true,
    consume: true,
    mic: false,
    webcam: false,
    displayName: '',
  });

  const { connect, disconnect, isConnected } = client;
  const navigate = useNavigate();

  const requestJoin = useCallActionStore((s) => s.requestJoin);
  const requestLeave = useCallActionStore((s) => s.requestLeave);
  const reset = useCallActionStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (!requestJoin || isConnected) return;
    (async () => {
      try {
        await connect();
      } finally {
        reset();
      }
    })();
  }, [requestJoin, isConnected, connect, reset]);

  useEffect(() => {
    if (!requestLeave) return;
    (async () => {
      try {
        await disconnect();
      } finally {
        reset();
        navigate(`/${roomId}/schedule`);
      }
    })();
  }, [requestLeave, disconnect, reset, navigate, roomId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return <Ctx.Provider value={client}>{children}</Ctx.Provider>;
}

export function useCallSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCallSession must be used within CallSessionProvider');
  return v;
}
