<div align="center">
  <h1>✓ Tasqly</h1>
  <p>A modern and smart task management app for students and professionals</p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Ant Design](https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)
  ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

  **🌐 [Live Demo](https://tasqly-three.vercel.app)**
</div>

---

## What is Tasqly?

Tasqly is a web-based task management application designed for everyone, from middle and high school students to college students and working professionals. Instead of manually selecting a priority level, Tasqly automatically calculates task priority based on how important the task is and how close the deadline is. This helps users focus on what truly matters.

Tasqly is also a Progressive Web App (PWA), which means it can be installed on any device like a native app without going through an app store.

---

## Features

- **Authentication** - Register and login securely with Supabase Auth
- **Task Management** - Create, edit, delete, and complete tasks with full CRUD support
- **Automatic Priority Calculation** - Priority score is calculated automatically based on importance and deadline proximity
- **Calendar View** - See all task deadlines visualized on a monthly calendar
- **Dashboard** - View task statistics, overall progress, and upcoming deadlines
- **Notification Reminders** - Set custom reminder times and notification sounds before a deadline
- **Profile Management** - Upload and crop a profile photo
- **Dark and Light Theme** - Toggle between themes, preference is saved automatically
- **PWA Support** - Install Tasqly on Android, iOS, or PC like a native app

---

## How Priority is Calculated

Tasqly calculates priority automatically using this formula:

```
Priority Score = (Importance x 0.6) + (Deadline Score x 0.4)
```

**Deadline Score:**

| Time Until Deadline | Score |
|---|---|
| Already passed | 5 |
| Less than 1 day | 4 |
| Less than 3 days | 3 |
| Less than 7 days | 2 |
| More than 7 days | 1 |

**Priority Label:**

| Score | Label |
|---|---|
| 4.0 and above | High |
| 2.5 and above | Medium |
| Below 2.5 | Low |

---

## How to Use

**1. Register an Account**

Open the app and click the Daftar tab. Fill in your name, email, and password, then click Daftar to create your account.

**2. Add a Task**

Go to the Tasks page and click the Tambah Task button. Fill in the task name, description, importance level (1 to 5), estimated time, deadline, and category. The app will automatically calculate the priority score.

**3. View Your Dashboard**

The Dashboard page shows your total tasks, completed tasks, high priority count, overall progress, and tasks with upcoming deadlines.

**4. Check the Calendar**

Go to the Calendar page to see all your task deadlines on a monthly calendar. Click on any date to see the tasks due that day.

**5. Set Up Notifications**

Click your profile avatar in the top right corner and select Notifikasi. Enable reminders and choose how many days before the deadline you want to be notified. You can also select a notification sound and test it before saving.

**6. Edit Your Profile**

Click your profile avatar and select Edit Profile. You can update your name and upload a profile photo. The crop tool lets you adjust the photo before saving.

**7. Install as an App**

Open Tasqly in Chrome on your phone or PC. Tap the install icon in the address bar or go to the browser menu and select Install App. Tasqly will appear on your home screen like a native app.

---

## Tech Stack

**Frontend** (`apps/web`)

| Technology | Purpose |
|---|---|
| React + Vite | UI framework and build tool |
| Ant Design v5 | UI component library |
| Zustand | Global state management |
| React Router | Client-side routing |
| Vite PWA Plugin | Progressive Web App support |

**Backend** (`apps/api`)

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| JWT | Authentication guard |
| Passport.js | Auth middleware |

**Database and Infrastructure**

| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL database and Auth |
| Vercel | Frontend deployment |

---

## Project Structure

```
tasqly/
├── apps/
│   ├── web/                 # React Frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── pages/       # App pages
│   │   │   ├── store/       # Zustand state
│   │   │   ├── styles/      # Design tokens and theme
│   │   │   └── utils/       # Helper functions
│   │   └── vite.config.js
│   └── api/                 # NestJS Backend
│       └── src/
│           ├── auth/        # Auth module
│           └── tasks/       # Tasks module
└── README.md
```

---

## Running Locally

**Prerequisites**
- Node.js v18+
- npm v9+

**Frontend**
```bash
cd apps/web
npm install
npm run dev
```

**Backend**
```bash
cd apps/api
npm install
npm run start:dev
```

**Environment Variables**

Create a `.env` file in `apps/web/`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create a `.env` file in `apps/api/`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

---

## Developer

**Gilbert** - Computer Science Student, Bina Nusantara University (BINUS)

[![GitHub](https://img.shields.io/badge/GitHub-SunHokk-181717?style=flat&logo=github)](https://github.com/SunHokk)