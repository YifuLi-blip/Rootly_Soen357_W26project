import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { INITIAL_USER, BADGES, type UserProfile, type Opportunity, type Badge } from '../data/mockData';

// ============================================================
// APP CONTEXT
// 
// Manages global state: mode toggle, user data, notifications.
// The mode flag controls which features are visible, enabling
// the between-subjects study design described in our proposal.
// ============================================================

interface Notification {
  id: number;
  msg: string;
  type: 'success' | 'xp' | 'badge' | 'info';
}

interface AppContextType {
  // Mode
  mode: 'full' | 'control';
  isFullMode: boolean;
  toggleMode: () => void;
  
  // User
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  
  // Notifications
  notifications: Notification[];
  addNotification: (msg: string, type?: Notification['type']) => void;
  
  // Onboarding
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  
  // Actions
  handleSignUp: (oppId: number) => void;
  handleCompleteActivity: (opp: Opportunity) => { showReflection: boolean; showLogHours: boolean };
  handleLogHours: (opp: Opportunity, hours: number) => void;
  handleSubmitReflection: (opp: Opportunity, answers: Record<number, string>) => void;
  handleAddGoal: (title: string, target: number, unit: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'full' | 'control'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'control' ? 'control' : 'full';
  });
  const [user, setUser] = useState<UserProfile>({ ...INITIAL_USER });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const isFullMode = mode === 'full';

  const toggleMode = useCallback(() => {
    setMode(m => m === 'full' ? 'control' : 'full');
  }, []);

  const addNotification = useCallback((msg: string, type: Notification['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500);
  }, []);

  const handleSignUp = useCallback((oppId: number) => {
    setUser(prev => ({ ...prev, signedUp: [...prev.signedUp, oppId] }));
    addNotification('Successfully signed up for this activity!');
    if (isFullMode) {
      setTimeout(() => addNotification('+50 XP earned for signing up!', 'xp'), 500);
    }
  }, [isFullMode, addNotification]);

  const handleCompleteActivity = useCallback((opp: Opportunity) => {
    if (isFullMode) {
      return { showReflection: true, showLogHours: false };
    }
    return { showReflection: false, showLogHours: true };
  }, [isFullMode]);

  const handleLogHours = useCallback((opp: Opportunity, hours: number) => {
    setUser(prev => ({
      ...prev,
      totalHours: prev.totalHours + hours,
      activitiesCompleted: prev.activitiesCompleted + 1,
      completedIds: [...prev.completedIds, opp.id],
      signedUp: prev.signedUp.filter(id => id !== opp.id),
      recentActivity: [
        { date: 'Today', title: opp.title, hours, xp: 0, category: opp.category },
        ...prev.recentActivity,
      ],
    }));
    addNotification(`Logged ${hours} hours for "${opp.title}"`);
  }, [addNotification]);

  const handleSubmitReflection = useCallback((opp: Opportunity, answers: Record<number, string>) => {
    const xpEarned = opp.hours * 50 + 100;
    setUser(prev => ({
      ...prev,
      totalHours: prev.totalHours + opp.hours,
      xp: prev.xp + xpEarned,
      activitiesCompleted: prev.activitiesCompleted + 1,
      completedIds: [...prev.completedIds, opp.id],
      signedUp: prev.signedUp.filter(id => id !== opp.id),
      recentActivity: [
        { date: 'Today', title: opp.title, hours: opp.hours, xp: xpEarned, category: opp.category },
        ...prev.recentActivity,
      ],
    }));
    addNotification(`Completed "${opp.title}"!`, 'success');
    setTimeout(() => addNotification(`+${xpEarned} XP earned!`, 'xp'), 600);
    
    // Check for near-badge completion
    const almostDone = BADGES.find(b => !b.earned && b.progress && b.progress >= 90);
    if (almostDone) {
      setTimeout(() => addNotification(`Almost there! "${almostDone.name}" badge is ${almostDone.progress}% complete`, 'badge'), 1200);
    }
  }, [addNotification]);

  const handleAddGoal = useCallback((title: string, target: number, unit: string) => {
    setUser(prev => ({
      ...prev,
      goals: [...prev.goals, {
        id: Date.now(),
        title,
        current: 0,
        target,
        unit,
        icon: unit === 'hours' ? 'clock' : unit === 'activities' ? 'flag' : 'star',
        color: prev.goals.length % 2 === 0 ? '#4ea54e' : '#a855f7',
      }],
    }));
    addNotification('New goal created! 🎯');
  }, [addNotification]);

  return (
    <AppContext.Provider value={{
      mode, isFullMode, toggleMode,
      user, setUser,
      notifications, addNotification,
      hasOnboarded, setHasOnboarded,
      handleSignUp, handleCompleteActivity, handleLogHours, handleSubmitReflection, handleAddGoal,
    }}>
      {children}
    </AppContext.Provider>
  );
};