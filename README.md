# Rootly_Soen357_W26project

The app has two modes:

- **Full (Gamified)** — includes badges, XP, skill tracking, goal setting, post-activity reflection, progress visualizations
- **Control (Basic)** — browse opportunities, sign up, log hours — no gamification elements

Both modes share the same visual design and opportunity data, ensuring the only independent variable in the study is the presence of gamification features.

---

## Features

### Full (Gamified) Version

- **Personalized Onboarding** — 3-step survey matching interests, availability, and goals
- **Interactive Dashboard** — progress bars, weekly hours chart, skills radar, recent badges
- **Achievement System** — 12 badges across milestone, social, engagement, and growth categories
- **Skill Tracking** — 6 skill areas with levels and progress visualization
- **Goal Setting** — create custom goals with live progress tracking
- **Post-Activity Reflection** — guided 4-question form after each activity
- **XP & Leveling** — earn XP for sign-ups, completions, and reflections
- **Streak Tracking** — weekly volunteering streak counter

### Control (Basic) Version

- Browse volunteer opportunities with search and filters
- Sign up for activities
- Log hours after completion
- Basic profile with total hours and activity history

### Shared Features

- Fully responsive (desktop + mobile)
- Search and category filtering for opportunities
- Opportunity detail pages with organization info
- Consistent sage green + lilac purple color palette

---

## Tech Stack

| Tool                                          | Purpose                     |
| --------------------------------------------- | --------------------------- |
| [Vite](https://vitejs.dev/)                   | Build tool & dev server     |
| [React 18](https://react.dev/)                | UI framework                |
| [TypeScript](https://www.typescriptlang.org/) | Type safety                 |
| [Tailwind CSS 3](https://tailwindcss.com/)    | Utility-first styling       |
| [Recharts](https://recharts.org/)             | Data visualization (charts) |
| [Lucide React](https://lucide.dev/)           | Icon library                |

No backend or database required — all data is mock/hardcoded for prototype purposes.

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rootly.git
cd rootly

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel
```

---

## Project Structure

```
rootly/
├── public/
│   └── leaf.svg              # Favicon
├── src/
│   ├── context/
│   │   └── AppContext.tsx     # Global state (mode, user, notifications)
│   ├── data/
│   │   └── mockData.ts       # All mock data (opportunities, badges, user)
│   ├── App.tsx                # Main app with all pages and components
│   ├── index.css              # Global styles, animations, Tailwind
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts          # Vite type declarations
├── index.html
├── package.json
├── tailwind.config.js         # Custom color palette
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

### What Changes Between Modes

| Feature                  | Full ✅ | Control ❌ |
| ------------------------ | ------- | ---------- |
| XP & Leveling            | ✅      | ❌         |
| Badges & Achievements    | ✅      | ❌         |
| Skill Tracking           | ✅      | ❌         |
| Goal Setting             | ✅      | ❌         |
| Post-Activity Reflection | ✅      | ❌         |
| Streak Counter           | ✅      | ❌         |
| Weekly Hours Chart       | ✅      | ❌         |
| Skills Radar             | ✅      | ❌         |
| Onboarding Survey        | ✅      | ❌         |
| Impact Statements        | ✅      | ❌         |
| Browse Opportunities     | ✅      | ✅         |
| Sign Up for Activities   | ✅      | ✅         |
| Log Hours                | ✅      | ✅         |
| Profile & History        | ✅      | ✅         |

---

## Team

| Name               | Student ID |
| ------------------ | ---------- |
| Nasib Guma         | 40283693   |
| Robert Craciunescu | 40282245   |
| Yifu Li            | 40286100   |
| George Myttas      | 40227005   |
| Shouzhu Zhang      | 40069738   |

---
