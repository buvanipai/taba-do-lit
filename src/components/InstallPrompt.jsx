import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.navigator.standalone;
    setIsIOS(ios);

    if (ios && !standalone) {
      // Show iOS instructions after 3s
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  async function handleInstall() {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setShow(false);
    }
  }

  return (
    <div className="install-banner glass-card">
      <span className="install-icon">📲</span>
      <div className="install-text">
        {isIOS && !prompt ? (
          <span>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> to install</span>
        ) : (
          <span>Install taba as an app</span>
        )}
      </div>
      {!isIOS && prompt && (
        <button className="btn-primary install-btn" onClick={handleInstall}>Install</button>
      )}
      <button className="btn-close" onClick={() => setShow(false)}>✕</button>
    </div>
  );
}
