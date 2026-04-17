# 🗂️ Kanban Board

A modern, Jira-inspired Kanban task management app built with React, TypeScript, and Zustand. Designed to be clean, fast, and scalable.

![Kanban Board](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-orange?style=flat)

---

## ✨ Features

- **Drag & Drop** — Move tasks between columns and reorder both tasks and columns
- **Title + Description** — Each task has a title and an optional description
- **Persistent State** — All your data is saved to browser localStorage automatically
- **Custom Columns** — Add, delete, and reorder columns freely
- **Special Themes** — Built-in colour themes per column (blue, red, green) with support for special named columns like "Force In Progress" (bold yellow + caution badge)
- **Dark Mode** — Premium dark theme with subtle colour accents
- **Keyboard-safe** — Typing in any input/textarea never accidentally triggers drag-and-drop
- **Scalable Architecture** — Clean separation of types, store, components, and styles

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Language | TypeScript |
| State | Zustand (with localStorage persistence) |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Icons | lucide-react |
| Styling | Vanilla CSS with CSS Variables |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Board/          # Main kanban board + DnD context
│   ├── Column/         # Individual column with task list
│   ├── Header/         # App header
│   ├── TaskCard/       # Draggable task card
│   └── ui/             # Reusable UI primitives (Button, etc.)
├── store/
│   └── useTaskStore.ts # Zustand store — all state & actions
├── types/
│   └── index.ts        # TypeScript interfaces (Task, Column)
├── styles/
│   ├── variables.css   # Design tokens (colors, spacing, radii)
│   └── global.css      # Global resets and base styles
└── utils/
    └── index.ts        # Helper utilities (ID generation, etc.)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/kanban-board.git
cd kanban-board

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 🗺️ Roadmap

- [ ] Task priority levels (Low / Medium / High / Critical)
- [ ] Due dates and calendar view
- [ ] Task labels / tags
- [ ] Search and filter
- [ ] Multiple boards
- [ ] Backend + user auth (Supabase or Firebase)
- [ ] Collaborative real-time editing

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ❤️ using React + TypeScript + Zustand
