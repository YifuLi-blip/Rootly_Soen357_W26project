import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_USER, BADGES, type UserProfile, type Opportunity, type Skill } from '../data/mockData';
import { trackEvent } from '../hooks/useAnalytics';
import { endSession } from '../hooks/useAnalytics';

interface Notification {
  id: number;
  msg: string;
  type: 'success' | 'xp' | 'badge' | 'info';
}

interface AppContextType {
  mode: 'full' | 'control';
  isFullMode: boolean;
  toggleMode: () => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  notifications: Notification[];
  addNotification: (msg: string, type?: Notification['type']) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  handleSignUp: (oppId: number) => void;
  handleCompleteActivity: (opp: Opportunity) => { showReflection: boolean; showLogHours: boolean };
  handleLogHours: (opp: Opportunity, hours: number) => void;
  handleSubmitReflection: (opp: Opportunity, answers: Record<number, string>) => void;
  handleAddGoal: (title: string, target: number, unit: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const SKILL_COLORS = ['#4ea54e', '#a855f7', '#4ECDC4', '#FFB347', '#FF6B9D', '#7EC8E3'];

const updateGoalProgress = (user: UserProfile, hoursToAdd: number) => {
  return user.goals.map(goal => {
    if (goal.unit === 'hours') {
      return { ...goal, current: Math.min(goal.current + hoursToAdd, goal.target) };
    }
    if (goal.unit === 'activities') {
      return { ...goal, current: Math.min(goal.current + 1, goal.target) };
    }
    return goal;
  });
};

const updateSkills = (skills: Skill[], activitySkills: string[]) => {
  const nextSkills = [...skills];

  activitySkills.forEach(skillName => {
    const existingIndex = nextSkills.findIndex(skill => skill.name === skillName);

    if (existingIndex >= 0) {
      const current = nextSkills[existingIndex];
      const nextProgress = current.progress + 20;
      nextSkills[existingIndex] = {
        ...current,
        level: current.level + Math.floor(nextProgress / 100),
        progress: nextProgress % 100,
      };
      return;
    }

    nextSkills.push({
      name: skillName,
      level: 1,
      progress: 25,
      color: SKILL_COLORS[nextSkills.length % SKILL_COLORS.length],
    });
  });

  return nextSkills;
};

export const AppProvider = ({ children, uid, onLogout: onLogoutProp }: { children: ReactNode; uid: string; onLogout: () => void }) => {
  const [mode, setMode] = useState<'full' | 'control'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'control' ? 'control' : 'full';
  });
  const [user, setUser] = useState<UserProfile>({ ...INITIAL_USER });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasOnboarded, setHasOnboardedState] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPageState] = useState('dashboard');

  const isFullMode = mode === 'full';

  useEffect(() => {
    const loadUser = async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as Partial<UserProfile> & { hasOnboarded?: boolean };
        setUser({ ...INITIAL_USER, ...data });
        if (data.hasOnboarded) {
          setHasOnboardedState(true);
        }
      }
      setLoaded(true);
    };
    loadUser();
  }, [uid]);

  useEffect(() => {
    if (!loaded) return;

    void setDoc(doc(db, 'users', uid), user, { merge: true });
  }, [loaded, uid, user]);

  const setCurrentPage = useCallback((page: string) => {
    setCurrentPageState(page);
    trackEvent('page_view', mode, page, page);
  }, [mode]);

  const setHasOnboarded = useCallback((v: boolean) => {
    setHasOnboardedState(v);
    if (v) {
      trackEvent('onboarding_completed', mode, currentPage);
      void setDoc(doc(db, 'users', uid), { hasOnboarded: true }, { merge: true });
    }
  }, [mode, currentPage, uid]);

  const toggleMode = useCallback(() => {
    setMode(m => {
      const newMode = m === 'full' ? 'control' : 'full';
      trackEvent('mode_switched', newMode, currentPage, `switched to ${newMode}`);
      return newMode;
    });
  }, [currentPage]);

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
    trackEvent('opportunity_signup', mode, currentPage, `opportunity_${oppId}`);
  }, [isFullMode, addNotification, mode, currentPage]);

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
      goals: updateGoalProgress(prev, hours),
      skills: updateSkills(prev.skills, opp.skills),
      recentActivity: [
        { date: 'Today', title: opp.title, hours, xp: 0, category: opp.category },
        ...prev.recentActivity,
      ],
    }));
    addNotification(`Logged ${hours} hours for "${opp.title}"`);
    trackEvent('hours_logged', mode, currentPage, `${opp.title} (${hours}h)`);
  }, [addNotification, mode, currentPage]);

  const handleSubmitReflection = useCallback((opp: Opportunity, answers: Record<number, string>) => {
    const xpEarned = opp.hours * 50 + 100;
    setUser(prev => ({
      ...prev,
      totalHours: prev.totalHours + opp.hours,
      xp: prev.xp + xpEarned,
      activitiesCompleted: prev.activitiesCompleted + 1,
      completedIds: [...prev.completedIds, opp.id],
      signedUp: prev.signedUp.filter(id => id !== opp.id),
      goals: updateGoalProgress(prev, opp.hours),
      skills: updateSkills(prev.skills, opp.skills),
      recentActivity: [
        { date: 'Today', title: opp.title, hours: opp.hours, xp: xpEarned, category: opp.category },
        ...prev.recentActivity,
      ],
    }));
    addNotification(`Completed "${opp.title}"!`, 'success');
    setTimeout(() => addNotification(`+${xpEarned} XP earned!`, 'xp'), 600);
    const almostDone = BADGES.find(b => !b.earned && b.progress && b.progress >= 90);
    if (almostDone) {
      setTimeout(() => addNotification(`Almost there! "${almostDone.name}" badge is ${almostDone.progress}% complete`, 'badge'), 1200);
    }
    trackEvent('opportunity_complete', mode, currentPage, opp.title);
    trackEvent('reflection_submitted', mode, currentPage, opp.title);
  }, [addNotification, mode, currentPage]);

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
    trackEvent('goal_created', mode, currentPage, `${title} (${target} ${unit})`);
  }, [addNotification, mode, currentPage]);

  const onLogout = useCallback(() => {
    endSession(mode, currentPage);
    onLogoutProp();
  }, [mode, currentPage, onLogoutProp]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-rootly-gradient flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      mode, isFullMode, toggleMode,
      user, setUser,
      notifications, addNotification,
      hasOnboarded, setHasOnboarded,
      handleSignUp, handleCompleteActivity, handleLogHours, handleSubmitReflection, handleAddGoal,
      currentPage, setCurrentPage,
      onLogout,
    }}>
      {children}
    </AppContext.Provider>
  );
};
