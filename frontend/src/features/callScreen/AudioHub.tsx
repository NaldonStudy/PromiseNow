import { useEffect, useMemo, useRef } from 'react';
import { useCallSession } from '../../hooks/webrtc/useCallSession';

function PeerAudio({ peerId, stream }: { peerId: string; stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const a = stream.getAudioTracks()[0];
    if (a && a.readyState === 'live' && !a.muted) {
      if (el.srcObject !== stream) el.srcObject = stream;
      el.play().catch(() => {});
    } else {
      if (el.srcObject) el.srcObject = null;
    }
    const bump = () => {
      if (el.srcObject !== stream) el.srcObject = stream;
      el.play().catch(() => {});
    };
    a?.addEventListener('unmute', bump);
    a?.addEventListener('mute', bump);
    a?.addEventListener('ended', bump);
    return () => {
      a?.removeEventListener('unmute', bump);
      a?.removeEventListener('mute', bump);
      a?.removeEventListener('ended', bump);
    };
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={peerId === 'local'}
      style={{ display: 'none' }}
    />
  );
}

export default function GlobalAudioHub() {
  const { peerStreams } = useCallSession();
  const entries = useMemo(() => Array.from(peerStreams.entries()), [peerStreams]);

  return (
    <>
      {entries.map(([pid, s]) => {
        const hasAudio = s && s.getAudioTracks()[0];
        if (!hasAudio) return null;
        return <PeerAudio key={pid} peerId={pid} stream={s} />;
      })}
    </>
  );
}
