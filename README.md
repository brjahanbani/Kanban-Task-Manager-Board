# Kanban Task Manager Board

A **Jira-inspired, personal Kanban board** built with React 19, TypeScript, and Supabase. Features drag-and-drop task management, real-time deadline countdowns, dark mode, and secure per-user authentication — all deployable for **free**.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase) ![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)

---

## ✨ Features

- **Drag & drop** columns and tasks (powered by dnd-kit)
- **Live deadline countdowns** — ticks every second; red badge when expired
- **Per-user authentication** — email + password via Supabase Auth
- **Cloud-synced data** — tasks saved to PostgreSQL, accessible from any device
- **Dark mode** with column-level color themes
- **"Force In Progress"** column — bold yellow warning style
- **Persistent ordering** — drag order saved to database

---

## 🛠 Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| State | Zustand |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Hosting | Vercel (recommended) |
| Styling | Vanilla CSS with CSS Variables |

---

## 🚀 Deploy Your Own (Free)

You need three free accounts: **GitHub**, **Supabase**, and **Vercel**.
Total setup time: ~15 minutes.

---

### Step 1 — Fork the repository

Click **Fork** (top-right of this page) to copy the project to your GitHub account.

---

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub
2. Click **New project** → name it `kanban-board` → choose a region → set a DB password → **Create**
3. Wait ~2 minutes for provisioning

---

### Step 3 — Set up the database

In your Supabase project, go to **SQL Editor → New query**, paste the SQL below, and click **Run**:

```sql
-- Tables
CREATE TABLE columns (
  id       TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  user_id  TEXT
);

CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  column_id   TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  deadline    BIGINT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  BIGINT,
  user_id     TEXT
);

-- Row Level Security (each user only sees their own data)
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_columns" ON columns;
DROP POLICY IF EXISTS "auth_tasks"   ON tasks;

CREATE POLICY "auth_columns" ON columns FOR ALL
  USING  (auth.uid()::text = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "auth_tasks" ON tasks FOR ALL
  USING  (auth.uid()::text = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);
```

Expected result: **"Success. No rows returned."**

---

### Step 4 — Get your Supabase API keys

In your Supabase project: **Settings → API**

Copy these two values — you will need them in Step 6:

| Key | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | "Project URL" (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | "anon public" key (long JWT string) |

---

### Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign in with GitHub**
2. Click **Add New Project** → select your forked `Kanban-Task-Manager-Board` repository
3. Framework is auto-detected as **Vite** ✅
4. Expand **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Project URL from Step 4 |
   | `VITE_SUPABASE_ANON_KEY` | your anon key from Step 4 |

5. Click **Deploy**

Your board will be live at `https://your-project.vercel.app` in ~60 seconds. 🎉

---

### Step 6 — Create your account

1. Open your deployed URL
2. Click **Sign Up** → enter your email and a password
3. Check your email for a confirmation link from Supabase → click it
4. Sign in — your private board is ready!

> **Note:** By default, Supabase requires email confirmation. You can disable this in:
> Supabase → **Authentication → Settings → Email Auth → Confirm email** (toggle off for immediate login).

---

## 💻 Local Development

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/Kanban-Task-Manager-Board.git
cd Kanban-Task-Manager-Board

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Then edit .env and fill in your Supabase URL and anon key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🔑 Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ `.env` is in `.gitignore` — your keys are never committed to Git. Add them manually to Vercel via the dashboard.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Board/          # DnD context, column layout
│   ├── Column/         # Column card with add-task form
│   ├── Header/         # Top bar with user + logout
│   └── TaskCard/       # Task card with countdown timer
├── hooks/
│   └── useCountdown.ts # Live deadline countdown hook
├── lib/
│   └── supabase.ts     # Supabase client singleton
├── pages/
│   └── LoginPage/      # Email + password auth UI
├── store/
│   └── useTaskStore.ts # Zustand store — all DB operations
├── styles/
│   ├── variables.css   # Design tokens (colors, spacing)
│   └── global.css      # Base reset + typography
└── types/
    └── index.ts        # TypeScript interfaces (Task, Column)
```

---

## 🔒 Security Model

Row Level Security (RLS) is enforced at the **database level** in PostgreSQL:

- Every row has a `user_id` column stamped with the authenticated user's ID
- Supabase validates the JWT on every request via `auth.uid()`
- Even with the public anon key, users can **only read and write their own rows**
- No backend server required — security lives in the database

---

## 🔄 Automatic Deployments

Once connected to Vercel:

```bash
git add .
git commit -m "feat: my improvement"
git push
```

Vercel automatically rebuilds and deploys in ~30 seconds on every push to `main`. ✅

---

## 📄 License

MIT — free to use, fork, and build upon.
