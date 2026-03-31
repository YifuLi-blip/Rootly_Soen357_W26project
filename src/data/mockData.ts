// ============================================================
// MOCK DATA — Rootly Prototype
// All data is hardcoded to simulate a real volunteering platform
// without requiring a backend or database.
// ============================================================

export interface Opportunity {
  id: number;
  title: string;
  org: string;
  category: string;
  location: string;
  date: string;
  time: string;
  hours: number;
  skills: string[];
  description: string;
  spots: number;
  spotsLeft: number;
  image: string;
  impact: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
  progress?: number;
  color: string;
  category: string;
}

export interface Skill {
  name: string;
  level: number;
  progress: number;
  color: string;
}

export interface Goal {
  id: number;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
}

export interface ActivityLog {
  date: string;
  title: string;
  hours: number;
  xp: number;
  category: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalHours: number;
  activitiesCompleted: number;
  currentStreak: number;
  joinDate: string;
  skills: Skill[];
  goals: Goal[];
  recentActivity: ActivityLog[];
  signedUp: number[];
  completedIds: number[];
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 1, title: "Community Garden Cleanup", org: "Green Montreal",
    category: "Environment", location: "Montreal, QC", date: "Apr 10, 2026",
    time: "9:00 AM - 12:00 PM", hours: 3,
    skills: ["Teamwork", "Physical Fitness", "Environmental Awareness"],
    description: "Help maintain and clean the community garden in Verdun. Tasks include weeding, planting seasonal flowers, and preparing garden beds for spring. All tools and gloves provided.",
    spots: 8, spotsLeft: 3, image: "garden",
    impact: "Your work helps maintain green spaces that serve 200+ community members weekly."
  },
  {
    id: 2, title: "Youth Tutoring Program", org: "Bright Futures Foundation",
    category: "Education", location: "Concordia University", date: "Apr 12, 2026",
    time: "3:00 PM - 5:00 PM", hours: 2,
    skills: ["Teaching", "Communication", "Patience", "Mentorship"],
    description: "Tutor high school students in math and science subjects. Help them prepare for upcoming exams and build confidence in STEM fields.",
    spots: 12, spotsLeft: 5, image: "tutoring",
    impact: "Students who receive tutoring show a 35% improvement in their test scores."
  },
  {
    id: 3, title: "Food Bank Sorting & Distribution", org: "Moisson Montreal",
    category: "Community", location: "St-Laurent, QC", date: "Apr 14, 2026",
    time: "8:00 AM - 1:00 PM", hours: 5,
    skills: ["Organization", "Teamwork", "Physical Fitness"],
    description: "Sort donated food items and help prepare distribution packages for families in need across Montreal. Lunch is provided for volunteers.",
    spots: 20, spotsLeft: 12, image: "foodbank",
    impact: "Each shift helps prepare meals for approximately 150 families in need."
  },
  {
    id: 4, title: "Senior Companion Visit", org: "Elder Care Network",
    category: "Social Services", location: "Westmount, QC", date: "Apr 15, 2026",
    time: "2:00 PM - 4:00 PM", hours: 2,
    skills: ["Empathy", "Communication", "Active Listening"],
    description: "Visit seniors at a local care facility. Spend time chatting, playing games, or simply keeping them company. Training session provided beforehand.",
    spots: 6, spotsLeft: 2, image: "seniors",
    impact: "Regular social visits reduce feelings of isolation in seniors by up to 40%."
  },
  {
    id: 5, title: "River Cleanup Initiative", org: "EcoAction Montreal",
    category: "Environment", location: "Lachine Canal", date: "Apr 17, 2026",
    time: "10:00 AM - 2:00 PM", hours: 4,
    skills: ["Environmental Awareness", "Teamwork", "Physical Fitness"],
    description: "Join the spring river cleanup along the Lachine Canal. Equipment, gloves, and refreshments provided. Great for groups!",
    spots: 30, spotsLeft: 18, image: "river",
    impact: "Last year's cleanup removed over 500kg of waste from Montreal waterways."
  },
  {
    id: 6, title: "Coding Workshop for Kids", org: "TechKids Montreal",
    category: "Education", location: "Online (Zoom)", date: "Apr 19, 2026",
    time: "1:00 PM - 3:00 PM", hours: 2,
    skills: ["Teaching", "Programming", "Communication", "Creativity"],
    description: "Lead an introductory coding workshop for children ages 10-14 using Scratch and basic Python concepts. Curriculum provided.",
    spots: 4, spotsLeft: 1, image: "coding",
    impact: "92% of kids who attend say they want to learn more about coding."
  },
  {
    id: 7, title: "Habitat Build Day", org: "Habitat for Humanity",
    category: "Community", location: "Longueuil, QC", date: "Apr 20, 2026",
    time: "7:00 AM - 3:00 PM", hours: 8,
    skills: ["Construction", "Teamwork", "Physical Fitness", "Leadership"],
    description: "Help build affordable housing for families. No prior construction experience required — all training provided on site. Meals included.",
    spots: 15, spotsLeft: 7, image: "habitat",
    impact: "Each build day contributes to housing a family who has been waiting for a safe home."
  },
  {
    id: 8, title: "Animal Shelter Support", org: "SPCA Montreal",
    category: "Animal Welfare", location: "Montreal, QC", date: "Apr 22, 2026",
    time: "11:00 AM - 3:00 PM", hours: 4,
    skills: ["Animal Care", "Empathy", "Patience", "Responsibility"],
    description: "Walk dogs, socialize cats, and help with daily shelter operations at the Montreal SPCA. Orientation session at 10:45 AM.",
    spots: 10, spotsLeft: 4, image: "shelter",
    impact: "Socialized animals are adopted 60% faster than those without volunteer interaction."
  },
];

export const INITIAL_USER: UserProfile = {
  name: "Alex Chen",
  avatar: "AC",
  level: 7,
  xp: 2350,
  xpToNext: 3000,
  totalHours: 47,
  activitiesCompleted: 12,
  currentStreak: 4,
  joinDate: "Jan 2026",
  skills: [
    { name: "Leadership", level: 3, progress: 65, color: "#4ea54e" },
    { name: "Communication", level: 4, progress: 80, color: "#a855f7" },
    { name: "Teamwork", level: 5, progress: 90, color: "#4ea54e" },
    { name: "Teaching", level: 2, progress: 40, color: "#a855f7" },
    { name: "Organization", level: 3, progress: 55, color: "#4ea54e" },
    { name: "Empathy", level: 4, progress: 70, color: "#a855f7" },
  ],
  goals: [
    { id: 1, title: "Volunteer 20 hours this month", current: 14, target: 20, unit: "hours", icon: "clock", color: "#4ea54e" },
    { id: 2, title: "Complete 5 activities", current: 3, target: 5, unit: "activities", icon: "flag", color: "#a855f7" },
    { id: 3, title: "Earn Leadership Level 4", current: 65, target: 100, unit: "%", icon: "star", color: "#4ea54e" },
  ],
  recentActivity: [
    { date: "Mar 28", title: "Youth Tutoring Program", hours: 2, xp: 150, category: "Education" },
    { date: "Mar 25", title: "Food Bank Sorting", hours: 5, xp: 300, category: "Community" },
    { date: "Mar 22", title: "Community Garden Cleanup", hours: 3, xp: 200, category: "Environment" },
    { date: "Mar 18", title: "Senior Companion Visit", hours: 2, xp: 180, category: "Social Services" },
    { date: "Mar 12", title: "River Cleanup Initiative", hours: 4, xp: 250, category: "Environment" },
  ],
  signedUp: [1, 5],
  completedIds: [2, 3, 4],
};

export const BADGES: Badge[] = [
  { id: 1, name: "First Steps", description: "Complete your first volunteer activity", icon: "leaf", earned: true, date: "Jan 15, 2026", color: "#4ea54e", category: "milestone" },
  { id: 2, name: "Team Player", description: "Participate in 5 group activities", icon: "users", earned: true, date: "Feb 3, 2026", color: "#9B7ED8", category: "social" },
  { id: 3, name: "Dedicated", description: "Volunteer for 20+ hours total", icon: "clock", earned: true, date: "Feb 20, 2026", color: "#4ECDC4", category: "milestone" },
  { id: 4, name: "Streak Master", description: "Maintain a 4-week volunteering streak", icon: "zap", earned: true, date: "Mar 10, 2026", color: "#FFB347", category: "engagement" },
  { id: 5, name: "Skill Builder", description: "Reach level 3 in any skill area", icon: "trending", earned: true, date: "Mar 15, 2026", color: "#FF6B9D", category: "growth" },
  { id: 6, name: "Community Hero", description: "Volunteer for 50+ hours total", icon: "trophy", earned: false, progress: 94, color: "#a855f7", category: "milestone" },
  { id: 7, name: "Mentor", description: "Complete 5 education-related activities", icon: "book", earned: false, progress: 60, color: "#7EC8E3", category: "category" },
  { id: 8, name: "Eco Warrior", description: "Complete 5 environment activities", icon: "tree", earned: false, progress: 40, color: "#4ea54e", category: "category" },
  { id: 9, name: "All-Rounder", description: "Volunteer in 4+ different categories", icon: "globe", earned: false, progress: 75, color: "#FFB347", category: "diversity" },
  { id: 10, name: "Century Club", description: "Reach 100 total volunteer hours", icon: "star", earned: false, progress: 47, color: "#FF6B9D", category: "milestone" },
  { id: 11, name: "Reflective Mind", description: "Complete 10 post-activity reflections", icon: "heart", earned: false, progress: 30, color: "#9B7ED8", category: "growth" },
  { id: 12, name: "Goal Setter", description: "Create and complete 3 personal goals", icon: "flag", earned: false, progress: 33, color: "#4ECDC4", category: "engagement" },
];

export const WEEKLY_HOURS = [
  { week: "W1", hours: 5 }, { week: "W2", hours: 3 }, { week: "W3", hours: 7 },
  { week: "W4", hours: 4 }, { week: "W5", hours: 6 }, { week: "W6", hours: 8 },
  { week: "W7", hours: 5 }, { week: "W8", hours: 9 },
];

export const SKILL_RADAR_DATA = [
  { skill: "Leadership", value: 65, fullMark: 100 },
  { skill: "Communication", value: 80, fullMark: 100 },
  { skill: "Teamwork", value: 90, fullMark: 100 },
  { skill: "Teaching", value: 40, fullMark: 100 },
  { skill: "Organization", value: 55, fullMark: 100 },
  { skill: "Empathy", value: 70, fullMark: 100 },
];

export const CATEGORIES = ["All", "Environment", "Education", "Community", "Social Services", "Animal Welfare"];

export const REFLECTION_QUESTIONS = [
  "What skills did you develop or strengthen during this activity?",
  "How did this experience contribute to your personal goals?",
  "What was the most meaningful moment of this activity?",
  "Would you recommend this opportunity to others? Why?",
];

export const ONBOARDING_INTERESTS = [
  { label: "Environment", icon: "tree", color: "#4ea54e" },
  { label: "Education", icon: "book", color: "#a855f7" },
  { label: "Community", icon: "users", color: "#4ECDC4" },
  { label: "Animal Welfare", icon: "heart", color: "#FF6B9D" },
  { label: "Social Services", icon: "coffee", color: "#FFB347" },
  { label: "Healthcare", icon: "shield", color: "#7EC8E3" },
];

export const ONBOARDING_AVAILABILITY = [
  "A few hours a week",
  "A few hours a month",
  "Once a month or less",
  "I'm flexible — surprise me!",
];

export const ONBOARDING_GOALS = [
  { label: "Build new skills", icon: "trending" },
  { label: "Make a difference in my community", icon: "heart" },
  { label: "Meet new people", icon: "users" },
  { label: "Fulfill course or work requirements", icon: "flag" },
  { label: "Personal growth and self-discovery", icon: "star" },
];