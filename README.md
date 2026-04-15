# Rootly

Rootly is the final prototype for the SOEN 357 project. It is a volunteering platform designed to compare a gamified experience against a basic control version while also collecting interaction data for analysis.

The app supports two study conditions:

- Full (Gamified): badges, XP, goals, skill growth, onboarding, reflections, progress charts
- Control (Basic): browse opportunities, sign up, log hours, view profile/history

Both modes use the same opportunities and general UI so the main experimental difference is the presence or absence of gamification.

## Current Prototype Scope

This version is no longer frontend-only.

- Frontend: React + TypeScript + Tailwind + Recharts
- Backend services: Firebase Authentication + Firestore
- Analytics storage: localStorage backup plus Firestore sync

The prototype is still partially mock-driven:

- Opportunity seed data is provided locally for first-time Firestore initialization
- Badge definitions are static, but unlock state and progress are computed dynamically
- Some profile defaults still come from initial seed data

## Implemented Features

### Shared Features

- Email/password sign up and sign in
- Responsive dashboard, explore page, and profile page
- Search and category filtering for opportunities
- Opportunity detail pages with organization, date, time, and location
- Sign up for activities, cancel sign-up, and complete/log them
- Opportunity availability persisted in Firestore
- User progress persisted in Firestore
- Admin CRUD for opportunities inside the in-app admin panel

### Full (Gamified) Mode

- 3-step onboarding flow
- XP and level display
- Goal creation and goal progress
- Skill growth tracking
- Weekly hours chart
- Skills radar chart
- Post-activity reflection flow
- Badge gallery and progress visuals

### Control (Basic) Mode

- Browse volunteer opportunities
- Sign up for activities
- Log volunteer hours
- View activity history and summary stats

### Study / Analytics Features

- Session tracking
- Page view tracking
- Opportunity view / signup / completion tracking
- Goal creation and reflection analytics
- Participant ID support
- Admin analytics panel with Firestore-backed aggregation
- In-app opportunity management panel for create / edit / delete
- CSV export for events, sessions, and summary reports

## Dynamic vs Mock Data

### Dynamic / Persisted

- Authenticated users in Firebase Auth
- User profile document in Firestore
- Opportunity catalog in Firestore
- Opportunity remaining spots in Firestore
- Signed-up opportunities
- Completed activities and recent activity log
- Total hours and activity counts
- Goals created by the user
- Goal progress updates after activity completion
- Skills growth updates after activity completion
- Onboarding completion flag
- Persisted badge snapshots in the user document
- Analytics events written to Firestore
- Weekly Hours chart derived from `recentActivity`
- Skills Radar chart derived from `skills`
- Badge unlock state and progress derived from live user data

### Still Mock / Static

- Opportunity seed data used to populate Firestore if the collection is empty
- Badge definitions and visual metadata
- Some starter profile values from `INITIAL_USER`
- Category metadata and onboarding option lists

## Tech Stack

| Tool | Purpose |
| --- | --- |
| Vite | Build tool and dev server |
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS 3 | Styling |
| Recharts | Data visualization |
| Lucide React | Icons |
| Firebase Auth | Authentication |
| Firestore | User data and analytics storage |

## Project Structure

```text
rootly/
├── public/
│   └── leaf.svg
├── src/
│   ├── context/
│   │   └── AppContext.tsx      # App state, Firestore sync, badges, opportunities
│   ├── data/
│   │   └── mockData.ts         # Badge definitions, seed opportunities, initial seed data
│   ├── hooks/
│   │   └── useAnalytics.ts     # Analytics tracking, export, Firestore utilities
│   ├── App.tsx                 # Main UI, pages, analytics and opportunity admin panel
│   ├── AuthPage.tsx            # Sign in / sign up page
│   ├── firebase.ts             # Firebase initialization
│   ├── index.css               # Global styles
│   ├── main.tsx                # App entry point
│   └── vite-env.d.ts
├── .env                        # Firebase env vars
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file with:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Firebase project with Authentication and Firestore enabled

### Install and Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Known Limitations

- Opportunity seed data still originates from local code before first Firestore sync
- Badge rules are computed on the client rather than in backend functions
- Analytics participant IDs are device-based and not linked to Firebase user IDs
- User profile writes are merge-based and do not use server timestamps
- Opportunity deletion does not yet cascade into existing user histories or sign-ups

## Team

| Name | Student ID |
| --- | --- |
| Nasib Guma | 40283693 |
| Robert Craciunescu | 40282245 |
| Yifu Li | 40286100 |
| George Myttas | 40227005 |
| Shouzhu Zhang | 40069738 |
