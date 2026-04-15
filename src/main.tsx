import React, { useState, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AuthPage from './AuthPage'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import './index.css'

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Unknown runtime error' }
  }

  componentDidCatch(error: Error) {
    console.error('Root render failed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-rootly-gradient flex items-center justify-center p-6">
          <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-6 shadow-soft">
            <h1 className="text-xl font-bold text-gray-800">App failed to load</h1>
            <p className="mt-2 text-sm text-gray-500">Open the browser console and share the error if this keeps happening.</p>
            <pre className="mt-4 overflow-auto rounded-2xl bg-red-50 p-4 text-xs text-red-700">{this.state.message}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function Root() {
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUid(user?.uid ?? null);
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const handleLogout = useCallback(() => {
    signOut(auth).then(() => setUid(null)).catch(() => setUid(null));
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-rootly-gradient flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!uid) {
    return <AuthPage onLogin={(id) => setUid(id)} />;
  }

  return <App uid={uid} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Root />
    </RootErrorBoundary>
  </React.StrictMode>,
)
