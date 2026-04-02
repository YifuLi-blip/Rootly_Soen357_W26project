import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AuthPage from './AuthPage'
import './index.css'

function Root() {
  const [uid, setUid] = useState<string | null>(null);

  if (!uid) {
    return <AuthPage onLogin={(id) => setUid(id)} />;
  }

  return <App uid={uid} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)