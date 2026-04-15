import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthPageProps {
  onLogin: (uid: string) => void;
}

const getAvatar = (displayName: string) => {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');

  return initials || 'RT';
};

const getJoinDate = () => {
  return new Date().toLocaleDateString('en-CA', {
    month: 'short',
    year: 'numeric',
  });
};

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onLogin(cred.user.uid);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const trimmedName = name.trim();
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: trimmedName,
          avatar: getAvatar(trimmedName),
          email,
          xp: 0,
          level: 1,
          xpToNext: 3000,
          totalHours: 0,
          activitiesCompleted: 0,
          currentStreak: 0,
          joinDate: getJoinDate(),
          signedUp: [],
          completedIds: [],
          recentActivity: [],
          goals: [],
          skills: [],
          badges: [],
          hasOnboarded: false,
        });
        onLogin(cred.user.uid);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-rootly-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-soft p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #4ea54e, #a855f7)' }}>
            <span className="text-white text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Rootly</h1>
          <p className="text-gray-500 text-sm">Grow through giving</p>
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              isLogin ? 'bg-white shadow text-gray-800' : 'text-gray-500'
            }`}>
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              !isLogin ? 'bg-white shadow text-gray-800' : 'text-gray-500'
            }`}>
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sage-400 text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sage-400 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sage-400 text-sm"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-rootly-primary w-full">
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
