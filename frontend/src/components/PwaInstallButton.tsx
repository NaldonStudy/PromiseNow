/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

const PwaInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
  };

  if (!visible) return null;
  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded shadow"
    >
      앱 설치하기
    </button>
  );
};

export default PwaInstallButton;
