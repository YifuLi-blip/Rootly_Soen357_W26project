import { useState, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import {
  Award, BookOpen, Calendar, ChevronRight, Clock, Check, Filter,
  Flag, Heart, Home, Leaf, LogOut, MapPin, Menu, MessageSquare,
  Search, Settings, Star, Target, TrendingUp, Trophy, User, Users,
  X, ChevronDown, ArrowRight, Sparkles, Zap, Shield, Globe,
  TreePine, Sun, Coffee, Plus, ArrowLeft, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';
import {
  OPPORTUNITIES, BADGES, WEEKLY_HOURS, SKILL_RADAR_DATA,
  CATEGORIES, REFLECTION_QUESTIONS, ONBOARDING_INTERESTS,
  ONBOARDING_AVAILABILITY, ONBOARDING_GOALS,
  type Opportunity
} from './data/mockData';

// ============================================================
// ICON HELPER
// Maps string names to Lucide icon components for dynamic rendering.
// ============================================================
const iconComponents: Record<string, React.ElementType> = {
  leaf: Leaf, users: Users, clock: Clock, zap: Zap, trending: TrendingUp,
  trophy: Trophy, book: BookOpen, tree: TreePine, globe: Globe, star: Star,
  flag: Flag, shield: Shield, heart: Heart, sun: Sun, coffee: Coffee,
  target: Target, award: Award,
};

const DynIcon = ({ name, ...props }: { name: string } & React.ComponentProps<typeof Leaf>) => {
  const Icon = iconComponents[name] || Leaf;
  return <Icon {...props} />;
};

// ============================================================
// OPPORTUNITY ILLUSTRATION
// Provides visual identity to each opportunity card.
//
// HCI: Recognition Rather Than Recall (Nielsen Heuristic #6)
// Color-coded category illustrations help users quickly identify
// opportunity types without reading the label.
// ============================================================
const illustrations: Record<string, { bg: string; icon: React.ElementType; iconColor: string }> = {
  garden:   { bg: 'from-sage-100 to-sage-200',   icon: TreePine,  iconColor: 'text-sage-600' },
  tutoring: { bg: 'from-lilac-100 to-lilac-200',  icon: BookOpen,  iconColor: 'text-lilac-600' },
  foodbank: { bg: 'from-amber-100 to-orange-200', icon: Heart,     iconColor: 'text-amber-600' },
  seniors:  { bg: 'from-rose-100 to-pink-200',    icon: Coffee,    iconColor: 'text-rose-500' },
  river:    { bg: 'from-cyan-100 to-sky-200',     icon: Globe,     iconColor: 'text-cyan-600' },
  coding:   { bg: 'from-indigo-100 to-violet-200', icon: Zap,      iconColor: 'text-indigo-600' },
  habitat:  { bg: 'from-yellow-100 to-amber-200', icon: Users,     iconColor: 'text-yellow-700' },
  shelter:  { bg: 'from-pink-100 to-rose-200',    icon: Heart,     iconColor: 'text-pink-500' },
};

const OppIllustration = ({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' | 'lg' }) => {
  const ill = illustrations[type] || illustrations.garden;
  const Icon = ill.icon;
  const dims = size === 'sm' ? 'h-11 w-11 rounded-xl' : size === 'lg' ? 'h-44 w-full rounded-2xl' : 'h-32 w-full rounded-2xl';
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 48 : 32;
  return (
    <div className={`${dims} bg-gradient-to-br ${ill.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={ill.iconColor} size={iconSize} />
    </div>
  );
};

// ============================================================
// CATEGORY COLOR MAP
// ============================================================
const catColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Environment':     { bg: 'bg-sage-100',   text: 'text-sage-700',   dot: 'bg-sage-500' },
  'Education':       { bg: 'bg-lilac-100',  text: 'text-lilac-700',  dot: 'bg-lilac-500' },
  'Community':       { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  'Social Services': { bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-500' },
  'Animal Welfare':  { bg: 'bg-pink-100',   text: 'text-pink-700',   dot: 'bg-pink-500' },
};
const getCatColor = (cat: string) => catColors[cat] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };


// ============================================================
// MAIN APP SHELL
// ============================================================
function AppShell() {
  const { mode, isFullMode, toggleMode, user, notifications, hasOnboarded, setHasOnboarded } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Show onboarding on first visit in full mode
  const showOnboarding = isFullMode && !hasOnboarded;

  const navItems = isFullMode
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'opportunities', label: 'Explore', icon: Search },
        { id: 'goals', label: 'My Goals', icon: Target },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'profile', label: 'Profile', icon: User },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'opportunities', label: 'Explore', icon: Search },
        { id: 'profile', label: 'Profile', icon: User },
      ];

  const navigate = (page: string) => {
    setCurrentPage(page);
    setSelectedOpp(null);
    setSidebarOpen(false);
  };

  // ============================================================
  // SIDEBAR
  //
  // HCI: Visibility of System Status (Nielsen Heuristic #1)
  // The sidebar shows the user's current level and XP progress
  // at all times, providing continuous feedback on their standing.
  //
  // HCI: Consistency & Standards (Nielsen Heuristic #4)
  // Navigation items use familiar icons and labels that follow
  // platform conventions users already understand.
  // ============================================================
  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white/95 via-sage-50/40 to-lilac-50/40 backdrop-blur-xl border-r border-sage-200/50 z-50 flex flex-col transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-5 pb-4 border-b border-sage-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-lilac-500 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold bg-gradient-to-r from-sage-600 to-lilac-600 bg-clip-text text-transparent">Rootly</h1>
              <p className="text-[11px] text-gray-400 tracking-wide">{isFullMode ? 'Grow through giving' : 'Volunteer Platform'}</p>
            </div>
          </div>
        </div>

        {/* User Card — Full mode only */}
        {isFullMode && (
          <div className="mx-4 mt-4 p-3 rounded-2xl bg-gradient-to-br from-sage-50 to-lilac-50 border border-sage-100/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-300 to-lilac-400 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <Star size={11} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-medium text-sage-700">Level {user.level}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>{user.xp.toLocaleString()} XP</span>
                <span>{user.xpToNext.toLocaleString()} XP</span>
              </div>
              <div className="h-2 bg-white/80 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-sage-400 via-sage-500 to-lilac-500 rounded-full animate-progressFill"
                  style={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 mt-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-sage-100/80 to-lilac-100/60 text-sage-800 shadow-sm border border-sage-200/50'
                    : 'text-gray-500 hover:bg-sage-50/60 hover:text-gray-700'
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sage-500" />}
              </button>
            );
          })}
        </nav>

        {/* Mode Indicator */}
        <div className="p-4 border-t border-sage-100/50">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/80">
            <div className={`w-2 h-2 rounded-full ${isFullMode ? 'bg-sage-500 animate-pulseGlow' : 'bg-gray-400'}`} />
            <span className="text-[11px] text-gray-500 font-medium">{isFullMode ? 'Full Version' : 'Control Version'}</span>
          </div>
        </div>
      </aside>
    </>
  );

  // ============================================================
  // NOTIFICATION TOASTS
  //
  // HCI: Feedback (Norman's Interaction Design Principles)
  // Every user action triggers immediate visual feedback through
  // toast notifications, confirming the system received their input.
  //
  // Color coding follows natural mappings: green = success,
  // purple = XP gain, gold = badge progress.
  // ============================================================
  const Toasts = () => (
    <div className="fixed top-4 right-4 z-[60] space-y-2 pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold animate-slideDown pointer-events-auto ${
            n.type === 'xp' ? 'bg-gradient-to-r from-lilac-500 to-lilac-600 text-white shadow-glow-purple'
            : n.type === 'badge' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
            : 'bg-gradient-to-r from-sage-500 to-sage-600 text-white shadow-glow-green'
          }`}
        >
          {n.msg}
        </div>
      ))}
    </div>
  );

  // ============================================================
  // MOBILE BOTTOM NAV
  //
  // HCI: Fitts's Law
  // Bottom navigation on mobile places targets at the edge of
  // the screen, making them infinitely easy to acquire with the
  // thumb. Icons + labels follow the Recognition principle.
  // ============================================================
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-white/85 backdrop-blur-xl border-t border-sage-200/50 z-40 lg:hidden safe-bottom">
      <div className="flex justify-around py-1">
        {navItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-all ${active ? 'text-sage-600' : 'text-gray-400'}`}
            >
              <item.icon size={20} strokeWidth={active ? 2.2 : 1.5} />
              <span className={`text-[10px] font-medium ${active ? 'text-sage-700' : 'text-gray-400'}`}>{item.label}</span>
              {active && <div className="w-4 h-0.5 rounded-full bg-sage-500 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ============================================================
  // PAGE: DASHBOARD
  //
  // HCI: Visibility of System Status (Nielsen #1)
  // Stats cards give immediate overview of the user's standing.
  //
  // HCI: Recognition Rather Than Recall (Nielsen #6)
  // Progress bars, charts, and badge displays make abstract
  // progress concrete and visible without requiring users to
  // remember past activities.
  //
  // Gamification: Self-Determination Theory — Competence
  // XP counter, level display, and progress visualizations
  // satisfy the need for competence by making growth visible.
  // ============================================================
  const DashboardPage = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-3xl ${isFullMode ? 'bg-gradient-to-br from-sage-500 via-sage-600 to-lilac-600' : 'bg-gradient-to-br from-sage-500 to-sage-600'} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-sage-100 text-sm font-medium mb-1">Welcome back,</p>
          <h2 className="text-2xl font-display font-bold mb-2">{user.name.split(' ')[0]}! 👋</h2>
          <p className="text-sage-100/80 text-sm max-w-md">
            {isFullMode
              ? `You're on a ${user.currentStreak}-week streak! Keep up the momentum and unlock new achievements.`
              : 'Here\'s a summary of your volunteering activity.'
            }
          </p>
          {isFullMode && (
            <div className="mt-4 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold flex items-center gap-1.5">
                <Zap size={12} className="text-amber-300" />
                {user.currentStreak}-week streak
              </div>
              <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold flex items-center gap-1.5">
                <Star size={12} className="text-amber-300 fill-amber-300" />
                Level {user.level}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid ${isFullMode ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} gap-3`}>
        {[
          { label: 'Total Hours', value: user.totalHours, icon: Clock, color: 'sage', suffix: 'h' },
          { label: 'Activities', value: user.activitiesCompleted, icon: Check, color: 'lilac', suffix: '' },
          ...(isFullMode ? [
            { label: 'Current Streak', value: user.currentStreak, icon: Zap, color: 'amber', suffix: ' weeks' },
            { label: 'Badges Earned', value: BADGES.filter(b => b.earned).length, icon: Award, color: 'rose', suffix: '' },
          ] : []),
        ].map((stat, i) => (
          <div key={stat.label} className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-soft hover:shadow-md transition-all duration-300 animate-fadeInUp stagger-${i + 1}`}>
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
              <stat.icon className={`text-${stat.color}-600`} size={20} />
            </div>
            <p className="text-2xl font-display font-bold text-gray-800">{stat.value}<span className="text-sm font-normal text-gray-400">{stat.suffix}</span></p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {isFullMode && (
        <>
          {/* Goals Quick View */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sage-200/40 p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-display font-bold text-gray-800 flex items-center gap-2">
                <Target size={18} className="text-sage-600" />
                Active Goals
              </h3>
              <button onClick={() => navigate('goals')} className="text-xs text-sage-600 hover:text-sage-700 font-semibold flex items-center gap-1">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="space-y-3">
              {user.goals.slice(0, 3).map((goal, i) => (
                <div key={goal.id} className={`flex items-center gap-3 animate-fadeInUp stagger-${i + 1}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${goal.color}18` }}>
                    <DynIcon name={goal.icon} size={16} style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 truncate">{goal.title}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{goal.current}/{goal.target}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full animate-progressFill"
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%`, background: `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sage-200/40 p-5 shadow-soft">
              <h3 className="text-base font-display font-bold text-gray-800 flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-sage-600" />
                Weekly Hours
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WEEKLY_HOURS} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '13px' }}
                    formatter={(v: number) => [`${v} hours`, 'Hours']}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ea54e" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="hours" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-lilac-200/40 p-5 shadow-soft">
              <h3 className="text-base font-display font-bold text-gray-800 flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-lilac-600" />
                Skills Radar
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={SKILL_RADAR_DATA} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Badges */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-lilac-200/40 p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-display font-bold text-gray-800 flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                Recent Badges
              </h3>
              <button onClick={() => navigate('achievements')} className="text-xs text-sage-600 hover:text-sage-700 font-semibold flex items-center gap-1">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {BADGES.filter(b => b.earned).map((badge, i) => (
                <div key={badge.id} className={`flex flex-col items-center gap-2 min-w-[76px] animate-fadeInUp stagger-${i + 1}`}>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-110 duration-200"
                    style={{ background: `${badge.color}15`, border: `2px solid ${badge.color}40` }}
                  >
                    <DynIcon name={badge.icon} size={22} style={{ color: badge.color }} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Upcoming / Signed Up */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-soft">
        <h3 className="text-base font-display font-bold text-gray-800 mb-4">
          {user.signedUp.length > 0 ? 'Your Upcoming Activities' : 'Recommended For You'}
        </h3>
        <div className="space-y-2">
          {(user.signedUp.length > 0
            ? OPPORTUNITIES.filter(o => user.signedUp.includes(o.id))
            : OPPORTUNITIES.slice(0, 3)
          ).map((opp, i) => (
            <div
              key={opp.id}
              onClick={() => { setSelectedOpp(opp); setCurrentPage('opportunities'); }}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-sage-50/60 transition-all cursor-pointer group animate-fadeInUp stagger-${i + 1}`}
            >
              <OppIllustration type={opp.image} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{opp.title}</p>
                <p className="text-xs text-gray-400">{opp.org} · {opp.date}</p>
              </div>
              {isFullMode && (
                <span className="text-xs font-bold text-lilac-600 bg-lilac-50 px-2 py-1 rounded-lg hidden sm:block">+{opp.hours * 50} XP</span>
              )}
              <ChevronRight className="text-gray-300 group-hover:text-sage-500 transition-colors" size={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Log (both modes, but styled differently) */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sage-200/40 p-5 shadow-soft">
        <h3 className="text-base font-display font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-1">
          {user.recentActivity.slice(0, 5).map((act, i) => {
            const cc = getCatColor(act.category);
            return (
              <div key={i} className={`flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50/60 transition-all animate-fadeInUp stagger-${i + 1}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${cc.dot}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{act.title}</p>
                    <p className="text-xs text-gray-400">{act.date} · {act.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sage-600">{act.hours}h</p>
                  {isFullMode && <p className="text-[11px] font-semibold text-lilac-500">+{act.xp} XP</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // PAGE: OPPORTUNITIES
  //
  // HCI: User Control & Freedom (Nielsen #3)
  // Search + category filters give users control over what they see.
  //
  // HCI: Aesthetic-Usability Effect
  // Card-based layout with illustrations creates visual appeal
  // and makes scanning a large list feel effortless.
  //
  // SDT: Autonomy
  // Users choose which opportunities align with their interests,
  // supporting the psychological need for autonomy.
  // ============================================================
  const OpportunitiesPage = () => {
    const [searchQ, setSearchQ] = useState('');
    const [catFilter, setCatFilter] = useState('All');

    const filtered = useMemo(() => OPPORTUNITIES.filter(o => {
      const matchCat = catFilter === 'All' || o.category === catFilter;
      const matchSearch = o.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        o.org.toLowerCase().includes(searchQ.toLowerCase()) ||
        o.category.toLowerCase().includes(searchQ.toLowerCase());
      return matchCat && matchSearch;
    }), [catFilter, searchQ]);

    if (selectedOpp) return <OppDetail opp={selectedOpp} onBack={() => setSelectedOpp(null)} />;

    return (
      <div className="space-y-5 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-800">Explore Opportunities</h2>
          <p className="text-gray-500 text-sm mt-1">Find activities that match your interests{isFullMode ? ' and grow your skills' : ''}.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, organization, or category..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all bg-white/80 text-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                catFilter === cat
                  ? 'bg-sage-600 text-white shadow-sm shadow-sage-200'
                  : 'bg-white/70 text-gray-600 hover:bg-white border border-gray-200 hover:border-sage-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opp, i) => {
            const cc = getCatColor(opp.category);
            return (
              <div
                key={opp.id}
                onClick={() => setSelectedOpp(opp)}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden shadow-soft hover:shadow-md cursor-pointer hover:-translate-y-1 transition-all duration-300 animate-fadeInUp stagger-${i + 1}`}
              >
                <OppIllustration type={opp.image} size="lg" />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cc.bg} ${cc.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cc.dot}`} />
                      {opp.category}
                    </span>
                    {isFullMode && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-lilac-100 text-lilac-700">
                        <Sparkles size={10} />
                        +{opp.hours * 50} XP
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-gray-800 mb-0.5">{opp.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{opp.org}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {opp.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {opp.hours}h</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {opp.location.split(',')[0]}</span>
                  </div>
                  {isFullMode && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {opp.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[11px] bg-sage-50 text-sage-700 px-2 py-0.5 rounded-md font-medium">{s}</span>
                      ))}
                      {opp.skills.length > 3 && <span className="text-[11px] text-gray-400">+{opp.skills.length - 3}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No opportunities found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // OPPORTUNITY DETAIL
  //
  // HCI: Match Between System & Real World (Nielsen #2)
  // Opportunity details are presented in a real-world language
  // structure: date, time, location, spots — not database fields.
  //
  // HCI: Help & Documentation (Nielsen #10)
  // Impact statements help users understand the significance
  // of their contribution without needing external info.
  // ============================================================
  const OppDetail = ({ opp, onBack }: { opp: Opportunity; onBack: () => void }) => {
    const { handleSignUp, handleCompleteActivity } = useApp();
    const [showReflection, setShowReflection] = useState(false);
    const [showLogHours, setShowLogHours] = useState(false);
    const isSignedUp = user.signedUp.includes(opp.id);
    const isCompleted = user.completedIds.includes(opp.id);
    const cc = getCatColor(opp.category);

    return (
      <div className="space-y-5 animate-fadeIn">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-sage-700 flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Explore
        </button>

        <OppIllustration type={opp.image} size="lg" />

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cc.bg} ${cc.text} mb-2`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cc.dot}`} />
                {opp.category}
              </span>
              <h2 className="text-2xl font-display font-bold text-gray-800">{opp.title}</h2>
              <p className="text-gray-500">{opp.org}</p>
            </div>
            {isFullMode && (
              <div className="text-right flex-shrink-0 px-4 py-3 rounded-2xl bg-gradient-to-br from-lilac-50 to-lilac-100 border border-lilac-200/50">
                <span className="text-2xl font-display font-bold text-lilac-600">+{opp.hours * 50 + 100}</span>
                <p className="text-[11px] text-lilac-500 font-medium">XP reward</p>
              </div>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-5">{opp.description}</p>

          {/* Impact callout — Full mode */}
          {isFullMode && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-sage-50 to-sage-100/50 border border-sage-200/50 mb-5">
              <Heart size={18} className="text-sage-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-sage-800">Your Impact</p>
                <p className="text-sm text-sage-700">{opp.impact}</p>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { icon: Calendar, label: 'Date', value: opp.date },
              { icon: Clock, label: 'Time', value: opp.time },
              { icon: MapPin, label: 'Location', value: opp.location.split(',')[0] },
              { icon: Users, label: 'Spots Left', value: `${opp.spotsLeft}/${opp.spots}` },
            ].map(info => (
              <div key={info.label} className="p-3 rounded-xl bg-gray-50/80 text-center">
                <info.icon className="mx-auto text-gray-400 mb-1" size={16} />
                <p className="text-sm font-semibold text-gray-700">{info.value}</p>
                <p className="text-[11px] text-gray-400">{info.label}</p>
              </div>
            ))}
          </div>

          {/* Skills — Full mode */}
          {isFullMode && (
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-lilac-500" />
                Skills You'll Develop
              </h4>
              <div className="flex flex-wrap gap-2">
                {opp.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-lilac-50 text-lilac-700 text-sm font-medium border border-lilac-200/50">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isCompleted ? (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-sage-50 border border-sage-200/50">
              <Check size={20} className="text-sage-600" />
              <span className="font-semibold text-sage-700">You've completed this activity!</span>
            </div>
          ) : isSignedUp ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  const result = handleCompleteActivity(opp);
                  if (result.showReflection) setShowReflection(true);
                  if (result.showLogHours) setShowLogHours(true);
                }}
                className="btn-rootly-primary flex items-center gap-2"
              >
                {isFullMode ? <><MessageSquare size={16} /> Complete & Reflect</> : <><Clock size={16} /> Log Hours</>}
              </button>
              <button
                onClick={() => {
                  const { setUser: su } = useApp();
                  // handled inline
                }}
                className="px-6 py-3 rounded-2xl font-semibold border-2 border-sage-200 text-sage-700 hover:bg-sage-50 transition-all min-h-[44px]"
              >
                Cancel Sign-up
              </button>
            </div>
          ) : (
            <button onClick={() => handleSignUp(opp.id)} className="btn-rootly-primary flex items-center gap-2">
              <ArrowRight size={16} /> Sign Up for This Activity
            </button>
          )}
        </div>

        {/* Reflection Modal */}
        {showReflection && <ReflectionModal opp={opp} onClose={() => setShowReflection(false)} />}
        {showLogHours && <LogHoursModal opp={opp} onClose={() => setShowLogHours(false)} />}
      </div>
    );
  };

  // ============================================================
  // REFLECTION MODAL
  //
  // HCI: Feedback + Closure (Norman)
  // The reflection form provides closure after completing an
  // activity, turning a passive event into an active learning moment.
  //
  // SDT: Relatedness
  // Reflection questions prompt users to consider their impact
  // on the community, reinforcing the sense of belonging.
  //
  // SDT: Competence
  // Asking "what skills did you develop?" helps users recognize
  // their own growth, satisfying the need for competence.
  // ============================================================
  const ReflectionModal = ({ opp, onClose }: { opp: Opportunity; onClose: () => void }) => {
    const { handleSubmitReflection } = useApp();
    const [answers, setAnswers] = useState<Record<number, string>>({});

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
          <div className="p-6 border-b border-sage-100/50 bg-gradient-to-r from-sage-50 to-lilac-50 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-gray-800">Post-Activity Reflection</h3>
                <p className="text-sm text-gray-500">{opp.title}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><X size={20} /></button>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-lilac-50 to-sage-50 border border-lilac-200/50">
              <div className="w-10 h-10 rounded-xl bg-lilac-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-lilac-600" size={18} />
              </div>
              <p className="text-sm text-gray-700">
                Reflecting on your experience helps you grow! You'll earn <span className="font-bold text-lilac-600">+{opp.hours * 50 + 100} XP</span> for completing this reflection.
              </p>
            </div>
            {REFLECTION_QUESTIONS.map((q, i) => (
              <div key={i}>
                <label className="text-sm font-semibold text-gray-700 block mb-2">{i + 1}. {q}</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lilac-400 focus:ring-2 focus:ring-lilac-100 outline-none transition-all bg-white/80 text-sm min-h-[80px] resize-none"
                  placeholder="Share your thoughts..."
                  value={answers[i] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={() => { handleSubmitReflection(opp, answers); onClose(); }} className="btn-rootly-accent flex items-center gap-2">
              <Check size={16} /> Submit Reflection
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // LOG HOURS MODAL (Control version)
  // ============================================================
  const LogHoursModal = ({ opp, onClose }: { opp: Opportunity; onClose: () => void }) => {
    const { handleLogHours } = useApp();
    const [hours, setHours] = useState('');

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl animate-scaleIn">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-display font-bold text-gray-800">Log Hours</h3>
            <p className="text-sm text-gray-500">{opp.title}</p>
          </div>
          <div className="p-6">
            <label className="text-sm font-semibold text-gray-700 block mb-2">Hours completed</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all bg-white/80 text-sm"
              type="number" placeholder={`e.g., ${opp.hours}`} value={hours} onChange={e => setHours(e.target.value)}
            />
          </div>
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={() => { handleLogHours(opp, parseInt(hours) || 0); onClose(); }} className="btn-rootly-primary">Log Hours</button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // PAGE: GOALS
  //
  // SDT: Autonomy
  // Users create their own goals, giving them ownership
  // over their volunteering trajectory.
  //
  // HCI: Visibility of System Status (Nielsen #1)
  // Progress bars with percentages provide clear status on
  // each goal, eliminating uncertainty about where they stand.
  //
  // Gamification: Goal-Gradient Effect (Kivetz et al., 2006)
  // As users approach their goal target, the visual progress
  // accelerates perceived progress and motivation.
  // ============================================================
  const GoalsPage = () => {
    const { handleAddGoal } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newUnit, setNewUnit] = useState('hours');

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800">My Goals</h2>
            <p className="text-gray-500 text-sm mt-1">Set targets and track your progress.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-rootly-primary flex items-center gap-2">
            <Plus size={16} /> New Goal
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {user.goals.map((goal, i) => {
            const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            return (
              <div key={goal.id} className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-soft animate-fadeInUp stagger-${i + 1}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${goal.color}15`, border: `2px solid ${goal.color}30` }}>
                    <DynIcon name={goal.icon} size={22} style={{ color: goal.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-gray-800 truncate">{goal.title}</h3>
                    <p className="text-sm text-gray-400">{pct}% complete</p>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full animate-progressFill transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${goal.color}, ${goal.color}aa)` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold" style={{ color: goal.color }}>{goal.current} {goal.unit}</span>
                  <span className="text-gray-400">{goal.target} {goal.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill Development */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-soft">
          <h3 className="text-base font-display font-bold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-lilac-600" />
            Skill Development
          </h3>
          <div className="space-y-4">
            {user.skills.map((skill, i) => (
              <div key={skill.name} className={`animate-fadeInUp stagger-${i + 1}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: skill.color, background: `${skill.color}15` }}>
                    Level {skill.level}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full animate-progressFill" style={{ width: `${skill.progress}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-display font-bold text-gray-800">Create New Goal</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Goal Title</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all bg-white/80 text-sm" placeholder="e.g., Volunteer 30 hours this month" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Target</label>
                    <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all bg-white/80 text-sm" type="number" placeholder="e.g., 30" value={newTarget} onChange={e => setNewTarget(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Unit</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-none transition-all bg-white/80 text-sm" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                      <option value="hours">Hours</option>
                      <option value="activities">Activities</option>
                      <option value="%">Percentage</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={() => { handleAddGoal(newTitle, parseInt(newTarget) || 0, newUnit); setShowModal(false); setNewTitle(''); setNewTarget(''); }} className="btn-rootly-primary">Create Goal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // PAGE: ACHIEVEMENTS
  //
  // Gamification: Variable Ratio Reinforcement
  // Showing locked badges with progress % creates anticipation
  // and motivates continued engagement to unlock them.
  //
  // SDT: Competence
  // Earned badges serve as tangible evidence of skill mastery,
  // directly satisfying the need for competence.
  //
  // HCI: Recognition (Nielsen #6)
  // Color-coded badges with icons allow instant recognition
  // of achievement types without reading descriptions.
  // ============================================================
  const AchievementsPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-800">Achievements</h2>
        <p className="text-gray-500 text-sm mt-1">Celebrate your milestones and unlock new badges.</p>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 px-5 py-3 shadow-soft flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center"><Trophy className="text-amber-600" size={16} /></div>
          <div>
            <span className="text-lg font-display font-bold text-gray-800">{BADGES.filter(b => b.earned).length}</span>
            <span className="text-xs text-gray-400 ml-1">Earned</span>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 px-5 py-3 shadow-soft flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><Star className="text-gray-400" size={16} /></div>
          <div>
            <span className="text-lg font-display font-bold text-gray-800">{BADGES.filter(b => !b.earned).length}</span>
            <span className="text-xs text-gray-400 ml-1">Locked</span>
          </div>
        </div>
      </div>

      {/* Earned */}
      <div>
        <h3 className="font-display font-bold text-gray-700 mb-3 flex items-center gap-2"><Award size={16} className="text-amber-500" /> Earned</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BADGES.filter(b => b.earned).map((badge, i) => (
            <div key={badge.id} className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-soft text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fadeInUp stagger-${i + 1}`}>
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-sm"
                style={{ background: `${badge.color}18`, border: `2px solid ${badge.color}40` }}
              >
                <DynIcon name={badge.icon} size={26} style={{ color: badge.color }} />
              </div>
              <h4 className="font-display font-bold text-gray-800 text-sm">{badge.name}</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-tight">{badge.description}</p>
              <p className="text-[11px] text-sage-600 font-medium mt-2">{badge.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Locked / In Progress */}
      <div>
        <h3 className="font-display font-bold text-gray-700 mb-3 flex items-center gap-2"><Target size={16} className="text-lilac-500" /> In Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BADGES.filter(b => !b.earned).map((badge, i) => (
            <div key={badge.id} className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-soft text-center opacity-80 hover:opacity-100 transition-all duration-300 animate-fadeInUp stagger-${i + 1}`}>
              <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300">
                <DynIcon name={badge.icon} size={26} className="text-gray-400" />
              </div>
              <h4 className="font-display font-bold text-gray-600 text-sm">{badge.name}</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-tight">{badge.description}</p>
              <div className="mt-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full animate-progressFill" style={{ width: `${badge.progress}%`, background: badge.color }} />
                </div>
                <p className="text-[11px] font-semibold mt-1" style={{ color: badge.color }}>{badge.progress}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // PAGE: PROFILE
  //
  // HCI: Visibility of System Status (Nielsen #1)
  // Aggregated stats give the user a complete picture of their
  // volunteering history at a single glance.
  //
  // SDT: Competence
  // The skills summary provides visible evidence of growth,
  // reinforcing the user's sense of development.
  // ============================================================
  const ProfilePage = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-sage-500 via-sage-600 to-lilac-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-display font-bold shadow-lg border border-white/20">
            {user.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">{user.name}</h2>
            {isFullMode && (
              <div className="flex items-center gap-2 mt-1">
                <Star size={14} className="text-amber-300 fill-amber-300" />
                <span className="font-medium">Level {user.level} Volunteer</span>
              </div>
            )}
            <p className="text-sm text-white/70 mt-0.5">Member since {user.joinDate}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid ${isFullMode ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} gap-3`}>
        {[
          { label: 'Hours Volunteered', value: user.totalHours, color: '#4ea54e' },
          { label: 'Activities Done', value: user.activitiesCompleted, color: '#a855f7' },
          ...(isFullMode ? [
            { label: 'Total XP', value: user.xp.toLocaleString(), color: '#f59e0b' },
            { label: 'Badges Earned', value: BADGES.filter(b => b.earned).length, color: '#f43f5e' },
          ] : []),
        ].map((stat, i) => (
          <div key={stat.label} className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-soft text-center animate-fadeInUp stagger-${i + 1}`}>
            <p className="text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity History */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-soft">
        <h3 className="text-base font-display font-bold text-gray-800 mb-4">Activity History</h3>
        <div className="space-y-1">
          {user.recentActivity.map((act, i) => {
            const cc = getCatColor(act.category);
            return (
              <div key={i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50/60 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${cc.bg} flex items-center justify-center`}>
                    <Check className={cc.text} size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{act.title}</p>
                    <p className="text-xs text-gray-400">{act.date} · {act.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sage-600">{act.hours}h</p>
                  {isFullMode && <p className="text-[11px] font-semibold text-lilac-500">+{act.xp} XP</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills — Full mode */}
      {isFullMode && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-soft">
          <h3 className="text-base font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-lilac-600" />
            Skills Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.skills.map(skill => (
              <div key={skill.name} className="p-3 rounded-xl bg-gray-50/80">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: skill.color, background: `${skill.color}15` }}>Lvl {skill.level}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${skill.progress}%`, background: skill.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================
  // ONBOARDING FLOW
  //
  // HCI: Progressive Disclosure
  // The onboarding is split into 3 focused steps instead of
  // one overwhelming form, reducing cognitive load.
  //
  // SDT: Autonomy
  // Letting users choose their interests, availability, and
  // goals gives them ownership from the very first interaction.
  //
  // HCI: Feedback (Norman)
  // A progress indicator at the top shows users exactly where
  // they are in the flow and how much is left.
  // ============================================================
  const OnboardingFlow = () => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({ interests: [] as string[], availability: '', goal: '' });

    const steps = [
      {
        title: 'What are you passionate about?',
        subtitle: 'Select your areas of interest — we\'ll match you with relevant opportunities.',
        content: (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ONBOARDING_INTERESTS.map(item => {
              const selected = data.interests.includes(item.label);
              return (
                <button
                  key={item.label}
                  onClick={() => setData(p => ({ ...p, interests: selected ? p.interests.filter(i => i !== item.label) : [...p.interests, item.label] }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col items-center gap-2 ${
                    selected ? 'border-sage-400 bg-sage-50 shadow-sm' : 'border-gray-200 hover:border-sage-300 bg-white/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                    <DynIcon name={item.icon} size={20} style={{ color: item.color }} />
                  </div>
                  <span className={`text-sm font-semibold ${selected ? 'text-sage-800' : 'text-gray-600'}`}>{item.label}</span>
                  {selected && <Check size={14} className="text-sage-600" />}
                </button>
              );
            })}
          </div>
        ),
      },
      {
        title: 'How often can you volunteer?',
        subtitle: 'This helps us set realistic goals for you.',
        content: (
          <div className="space-y-3">
            {ONBOARDING_AVAILABILITY.map(opt => (
              <button
                key={opt}
                onClick={() => setData(p => ({ ...p, availability: opt }))}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all duration-200 ${
                  data.availability === opt ? 'border-sage-400 bg-sage-50 text-sage-800 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-sage-300 bg-white/60'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ),
      },
      {
        title: 'What\'s your main goal?',
        subtitle: 'We\'ll personalize your dashboard and recommendations.',
        content: (
          <div className="space-y-3">
            {ONBOARDING_GOALS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setData(p => ({ ...p, goal: opt.label }))}
                className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  data.goal === opt.label ? 'border-lilac-400 bg-lilac-50 text-lilac-800 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-lilac-300 bg-white/60'
                }`}
              >
                <DynIcon name={opt.icon} size={18} className={data.goal === opt.label ? 'text-lilac-600' : 'text-gray-400'} />
                {opt.label}
              </button>
            ))}
          </div>
        ),
      },
    ];

    const current = steps[step];

    return (
      <div className="fixed inset-0 bg-rootly-gradient z-[70] flex items-center justify-center p-4">
        <div className="max-w-lg w-full animate-scaleIn">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-lilac-500 rounded-2xl flex items-center justify-center shadow-md">
              <Leaf className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-sage-600 to-lilac-600 bg-clip-text text-transparent">Rootly</h1>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden">
            <div className="p-6">
              {/* Progress bar */}
              <div className="flex gap-2 mb-6">
                {steps.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-sage-400 to-lilac-500' : 'bg-gray-200'}`} />
                ))}
              </div>

              <h3 className="text-xl font-display font-bold text-gray-800 mb-1">{current.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{current.subtitle}</p>
              {current.content}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between">
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 rounded-xl font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Back</button>
              ) : <div />}
              <button
                onClick={() => {
                  if (step < steps.length - 1) setStep(s => s + 1);
                  else setHasOnboarded(true);
                }}
                className={step < steps.length - 1 ? 'btn-rootly-primary' : 'btn-rootly-accent'}
              >
                {step < steps.length - 1 ? 'Next' : '🌱 Start My Journey'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'opportunities': return <OpportunitiesPage />;
      case 'goals': return isFullMode ? <GoalsPage /> : <DashboardPage />;
      case 'achievements': return isFullMode ? <AchievementsPage /> : <DashboardPage />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="bg-rootly-gradient min-h-screen relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="rootly-orb w-[500px] h-[500px] bg-sage-300 -top-48 -left-48 fixed" />
      <div className="rootly-orb w-[400px] h-[400px] bg-lilac-300 top-1/3 -right-32 fixed" />
      <div className="rootly-orb w-[350px] h-[350px] bg-sage-200 -bottom-32 left-1/3 fixed" />

      {showOnboarding && <OnboardingFlow />}
      <Sidebar />
      <Toasts />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/85 backdrop-blur-xl border-b border-sage-200/50 z-30 flex items-center justify-between px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 p-1">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-sage-400 to-lilac-500 rounded-lg flex items-center justify-center">
            <Leaf className="text-white" size={14} />
          </div>
          <span className="font-display font-bold text-gray-800">Rootly</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="p-5 md:p-8 pt-[72px] lg:pt-8 max-w-5xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <MobileNav />

      {/* Mode Toggle — Admin/Study Tool */}
      <div className="fixed bottom-20 lg:bottom-4 right-4 z-50">
        <button
          onClick={toggleMode}
          className="px-4 py-2 rounded-xl text-[11px] font-semibold bg-gray-800/90 text-white shadow-lg hover:bg-gray-700 transition-all backdrop-blur-sm flex items-center gap-2"
        >
          <Settings size={12} />
          {isFullMode ? 'Full (Gamified)' : 'Control (Basic)'} — Switch
        </button>
      </div>
    </div>
  );
}

// ============================================================
// APP WRAPPER
// ============================================================
export default function App({ uid }: { uid: string }) {
  return (
    <AppProvider uid={uid}>
      <AppShell />
    </AppProvider>
  );
}