import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, runTransaction, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { INITIAL_USER, OPPORTUNITIES, getDynamicBadges, type UserProfile, type Opportunity, type Skill, type Badge } from '../data/mockData';
import { trackEvent } from '../hooks/useAnalytics';

interface Notification {
  id: number;
  msg: string;
  type: 'success' | 'xp' | 'badge' | 'info';
}

interface AppLoadState {
  opportunitiesError: string;
  userError: string;
}

interface AppContextType {
  mode: 'full' | 'control';
  isFullMode: boolean;
  toggleMode: () => void;
  user: UserProfile;
  badges: Badge[];
  opportunities: Opportunity[];
  opportunitiesLoaded: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  notifications: Notification[];
  addNotification: (msg: string, type?: Notification['type']) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  handleSignUp: (oppId: number) => Promise<void>;
  handleCancelSignUp: (oppId: number) => Promise<void>;
  handleCompleteActivity: (opp: Opportunity) => { showReflection: boolean; showLogHours: boolean };
  handleLogHours: (opp: Opportunity, hours: number) => void;
  handleSubmitReflection: (opp: Opportunity, answers: Record<number, string>) => void;
  handleAddGoal: (title: string, target: number, unit: string) => void;
  saveOpportunity: (opportunity: Opportunity) => Promise<void>;
  deleteOpportunityById: (oppId: number) => Promise<void>;
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

const OPPORTUNITIES_COLLECTION = 'opportunities';

const sanitizeForFirestore = <T,>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(item => sanitizeForFirestore(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, sanitizeForFirestore(entryValue)])
    ) as T;
  }

  return value;
};

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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasOnboarded, setHasOnboardedState] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [opportunitiesLoaded, setOpportunitiesLoaded] = useState(false);
  const [currentPage, setCurrentPageState] = useState('dashboard');
  const [loadState, setLoadState] = useState<AppLoadState>({ opportunitiesError: '', userError: '' });

  const isFullMode = mode === 'full';
  const badges = useMemo(() => getDynamicBadges(user), [user]);

  useEffect(() => {
    const initializeAndSubscribe = async () => {
      try {
        const oppQuery = query(collection(db, OPPORTUNITIES_COLLECTION), orderBy('id', 'asc'));
        const snapshot = await getDocs(oppQuery);

        if (snapshot.empty) {
          const batch = writeBatch(db);
          OPPORTUNITIES.forEach(opportunity => {
            batch.set(doc(db, OPPORTUNITIES_COLLECTION, String(opportunity.id)), opportunity);
          });
          await batch.commit();
        }
      } catch (error) {
        console.error('Failed to initialize opportunities from Firestore:', error);
        setOpportunities(OPPORTUNITIES);
        setOpportunitiesLoaded(true);
        setLoadState(prev => ({ ...prev, opportunitiesError: 'Using local opportunity seed data.' }));
      }
    };

    let unsubscribe = () => {};

    void initializeAndSubscribe().then(() => {
      const oppQuery = query(collection(db, OPPORTUNITIES_COLLECTION), orderBy('id', 'asc'));
      unsubscribe = onSnapshot(oppQuery, snapshot => {
        setOpportunities(snapshot.docs.map(item => item.data() as Opportunity));
        setOpportunitiesLoaded(true);
        setLoadState(prev => ({ ...prev, opportunitiesError: '' }));
      }, error => {
        console.error('Failed to subscribe to opportunities:', error);
        setOpportunities(OPPORTUNITIES);
        setOpportunitiesLoaded(true);
        setLoadState(prev => ({ ...prev, opportunitiesError: 'Live opportunities unavailable. Showing local data.' }));
      });
    }).catch(error => {
      console.error('Opportunity initialization failed:', error);
      setOpportunities(OPPORTUNITIES);
      setOpportunitiesLoaded(true);
      setLoadState(prev => ({ ...prev, opportunitiesError: 'Live opportunities unavailable. Showing local data.' }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data() as Partial<UserProfile> & { hasOnboarded?: boolean };
          setUser({ ...INITIAL_USER, ...data });
          if (data.hasOnboarded) {
            setHasOnboardedState(true);
          }
        }
      } catch (error) {
        console.error('Failed to load user from Firestore:', error);
        setLoadState(prev => ({ ...prev, userError: 'Unable to load cloud profile. Showing local defaults.' }));
      } finally {
        setLoaded(true);
      }
    };
    loadUser();
  }, [uid]);

  useEffect(() => {
    if (!loaded) return;

    const userPayload = sanitizeForFirestore({ ...user, badges });
    void setDoc(doc(db, 'users', uid), userPayload, { merge: true });
  }, [loaded, uid, user, badges]);

  const setCurrentPage = useCallback((page: string) => {
    setCurrentPageState(page);
  }, []);

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
    if (user.signedUp.includes(oppId)) {
      return Promise.resolve();
    }

    return runTransaction(db, async transaction => {
      const oppRef = doc(db, OPPORTUNITIES_COLLECTION, String(oppId));
      const oppSnap = await transaction.get(oppRef);
      if (!oppSnap.exists()) {
        throw new Error('This opportunity is no longer available.');
      }

      const opportunity = oppSnap.data() as Opportunity;
      if (opportunity.spotsLeft <= 0) {
        throw new Error('No spots left for this opportunity.');
      }

      transaction.update(oppRef, { spotsLeft: opportunity.spotsLeft - 1 });
    }).then(() => {
      setUser(prev => (
        prev.signedUp.includes(oppId)
          ? prev
          : { ...prev, signedUp: [...prev.signedUp, oppId] }
      ));
      setOpportunities(prev => prev.map(opportunity => (
        opportunity.id === oppId
          ? { ...opportunity, spotsLeft: Math.max(opportunity.spotsLeft - 1, 0) }
          : opportunity
      )));
      addNotification('Successfully signed up for this activity!');
      if (isFullMode) {
        setTimeout(() => addNotification('+50 XP earned for signing up!', 'xp'), 500);
      }
      trackEvent('opportunity_signup', mode, currentPage, `opportunity_${oppId}`);
    }).catch((error: Error) => {
      addNotification(error.message || 'Unable to sign up right now.', 'info');
    });
  }, [user.signedUp, isFullMode, addNotification, mode, currentPage]);

  const handleCancelSignUp = useCallback((oppId: number) => {
    if (!user.signedUp.includes(oppId)) {
      return Promise.resolve();
    }

    return runTransaction(db, async transaction => {
      const oppRef = doc(db, OPPORTUNITIES_COLLECTION, String(oppId));
      const oppSnap = await transaction.get(oppRef);
      if (!oppSnap.exists()) {
        throw new Error('This opportunity is no longer available.');
      }

      const opportunity = oppSnap.data() as Opportunity;
      const nextSpotsLeft = Math.min(opportunity.spotsLeft + 1, opportunity.spots);
      transaction.update(oppRef, { spotsLeft: nextSpotsLeft });
    }).then(() => {
      setUser(prev => ({
        ...prev,
        signedUp: prev.signedUp.filter(id => id !== oppId),
      }));
      setOpportunities(prev => prev.map(opportunity => (
        opportunity.id === oppId
          ? { ...opportunity, spotsLeft: Math.min(opportunity.spotsLeft + 1, opportunity.spots) }
          : opportunity
      )));
      addNotification('Sign-up cancelled.');
      trackEvent('opportunity_cancel', mode, currentPage, `opportunity_${oppId}`);
    }).catch((error: Error) => {
      addNotification(error.message || 'Unable to cancel sign-up right now.', 'info');
    });
  }, [user.signedUp, addNotification, mode, currentPage]);

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
    const updatedUser = ((prev: UserProfile) => ({
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

    setUser(prev => ({
      ...updatedUser(prev),
    }));
    addNotification(`Completed "${opp.title}"!`, 'success');
    setTimeout(() => addNotification(`+${xpEarned} XP earned!`, 'xp'), 600);
    const almostDone = getDynamicBadges(updatedUser(user)).find(b => !b.earned && b.progress && b.progress >= 90);
    if (almostDone) {
      setTimeout(() => addNotification(`Almost there! "${almostDone.name}" badge is ${almostDone.progress}% complete`, 'badge'), 1200);
    }
    trackEvent('opportunity_complete', mode, currentPage, opp.title);
    trackEvent('reflection_submitted', mode, currentPage, opp.title);
  }, [addNotification, mode, currentPage, user]);

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

  const saveOpportunity = useCallback(async (opportunity: Opportunity) => {
    const normalized: Opportunity = {
      ...opportunity,
      spotsLeft: Math.min(opportunity.spotsLeft, opportunity.spots),
    };

    await setDoc(doc(db, OPPORTUNITIES_COLLECTION, String(normalized.id)), normalized);
    addNotification(`Saved "${normalized.title}"`);
  }, [addNotification]);

  const deleteOpportunityById = useCallback(async (oppId: number) => {
    await deleteDoc(doc(db, OPPORTUNITIES_COLLECTION, String(oppId)));
    addNotification('Opportunity deleted.');
  }, [addNotification]);

  const onLogout = useCallback(() => {
    onLogoutProp();
  }, [onLogoutProp]);

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
      badges,
      opportunities, opportunitiesLoaded,
      user, setUser,
      notifications, addNotification,
      hasOnboarded, setHasOnboarded,
      handleSignUp, handleCancelSignUp, handleCompleteActivity, handleLogHours, handleSubmitReflection, handleAddGoal,
      saveOpportunity, deleteOpportunityById,
      currentPage, setCurrentPage,
      onLogout,
    }}>
      {children}
      {(loadState.opportunitiesError || loadState.userError) && (
        <div className="fixed bottom-4 left-4 z-[90] max-w-sm rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 shadow-lg">
          {[loadState.opportunitiesError, loadState.userError].filter(Boolean).join(' ')}
        </div>
      )}
    </AppContext.Provider>
  );
};
