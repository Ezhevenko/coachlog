import { useState, useEffect, createContext, useContext } from 'react';
import App from '../App';

export const AuthContext = createContext<string | null>(null);
export const useAuthToken = () => useContext(AuthContext);

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
