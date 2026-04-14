import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AuthPage from './AuthPage'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import './index.css'

function Root() {
  const [uid, setUid] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => setUid(null)).catch(() => setUid(null));
  }, []);

  if (!uid) {
    return <AuthPage onLogin={(id) => setUid(id)} />;
  }

  return <App uid={uid} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)