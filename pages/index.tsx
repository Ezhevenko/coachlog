import { useState, useEffect } from 'react';
import App from '../App';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = window.localStorage.getItem('token');
    if (existing) {
      setToken(existing);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = () => {
      const initData = (window as any).Telegram?.WebApp?.initData;
      if (!initData) {
        setAuthFailed(true);
        return;
      }
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => {
          setToken(data.token);
          window.localStorage.setItem('token', data.token);
        })
        .catch(() => setAuthFailed(true));
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (token) {
    return <App />;
  }

  if (authFailed) {
    return <div>Open via Telegram</div>;
  }

  return <div>Authenticating...</div>;
}
