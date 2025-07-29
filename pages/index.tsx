import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import App from '../App';
import { AuthContext } from '../lib/auth-context';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [authFailed, setAuthFailed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existing = window.localStorage.getItem('token');
    if (existing) {
      setToken(existing);
      return;
    }

    const verify = (initData: string) => {
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => {
          window.localStorage.setItem('token', data.token);
          setToken(data.token);
        })
        .catch(() => setAuthFailed(true));
    };

    const handleReady = () => {
      const startParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (startParam) {
        router.replace(startParam as string);
        return;
      }
      const initData = (window as any).Telegram?.WebApp?.initData;
      if (initData) {
        verify(initData);
      } else {
        setAuthFailed(true);
      }
    };

    if ((window as any).Telegram?.WebApp) {
      handleReady();
    } else {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      script.onload = handleReady;
      script.onerror = () => setAuthFailed(true);
      document.body.appendChild(script);
    }
  }, []);

  if (token) {
    return (
      <AuthContext.Provider value={token}>
        <App />
      </AuthContext.Provider>
    );
  }

  if (authFailed) {
    return <div>Open via Telegram</div>;
  }

  return <div>Authenticating...</div>;
}
