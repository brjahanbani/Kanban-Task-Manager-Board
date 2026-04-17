import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Column, Id, Task } from '../types';
import { generateId } from '../utils';

// ── Row-level mappers (Supabase snake_case → our camelCase) ──────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapColumn = (row: any): Column => ({
  id: row.id,
  title: row.title,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTask = (row: any): Task => ({
  id: row.id,
  columnId: row.column_id,
  title: row.title,
  description: row.description ?? undefined,
  deadline: row.deadline ?? undefined,
  createdAt: row.created_at ?? undefined,
});

const DEFAULT_COLS = [
  { id: 'todo',        title: 'To Do',       position: 0 },
  { id: 'in-progress', title: 'In Progress', position: 1 },
  { id: 'done',        title: 'Done',        position: 2 },
];

// ── Store interface ───────────────────────────────────────────────────────────
interface TaskState {
  columns: Column[];
  tasks: Task[];
  loading: boolean;
  error: string | null;

  /** Load everything from Supabase on app mount */
  init: () => Promise<void>;

  addColumn: (title: string) => Promise<void>;
  deleteColumn: (id: Id) => Promise<void>;
  updateColumn: (id: Id, title: string) => Promise<void>;

  addTask: (columnId: Id, title: string, description?: string, deadline?: number) => Promise<void>;
  deleteTask: (id: Id) => Promise<void>;
  updateTask: (id: Id, title: string, description?: string, deadline?: number) => Promise<void>;

  /** Optimistic local updates during drag (no DB call yet) */
  setColumns: (columns: Column[]) => void;
  setTasks: (tasks: Task[]) => void;

  /** Persist the final order to Supabase after a drag ends */
  syncColumnOrder: (columns: Column[]) => Promise<void>;
  syncTaskOrder: (tasks: Task[]) => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useTaskStore = create<TaskState>()((set, get) => ({
  columns: [],
  tasks: [],
  loading: true,
  error: null,

  // ── init ──────────────────────────────────────────────────────────────────
  init: async () => {
    set({ loading: true, error: null });

    // Fetch columns
    let { data: cols, error: colErr } = await supabase
      .from('columns')
      .select('*')
      .order('position');

    if (colErr) { set({ loading: false, error: colErr.message }); return; }

    // Seed default columns if DB is empty
    if (!cols || cols.length === 0) {
      const { data: seeded, error: seedErr } = await supabase
        .from('columns')
        .insert(DEFAULT_COLS)
        .select();
      if (seedErr) { set({ loading: false, error: seedErr.message }); return; }
      cols = seeded;
    }

    // Fetch tasks
    let { data: tsks, error: tskErr } = await supabase
      .from('tasks')
      .select('*')
      .order('position');

    if (tskErr) { set({ loading: false, error: tskErr.message }); return; }

    // ── ONE-TIME MIGRATION: recover old localStorage data ─────────────────
    // If Supabase has no tasks yet, check if there's old data in localStorage
    if (!tsks || tsks.length === 0) {
      try {
        const raw = localStorage.getItem('kanban-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          const oldCols: Array<{ id: string; title: string }> =
            parsed?.state?.columns ?? [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldTasks: Array<any> =
            parsed?.state?.tasks ?? [];

          if (oldCols.length > 0) {
            // Upsert old columns (keeps default cols too)
            const colRows = oldCols.map((c, i) => ({
              id: c.id,
              title: c.title,
              position: i,
            }));
            await supabase.from('columns').upsert(colRows);

            // Upsert old tasks
            if (oldTasks.length > 0) {
              const taskRows = oldTasks.map((t, i) => ({
                id: t.id as string,
                column_id: (t.columnId ?? t.column_id) as string,
                title: t.title,
                description: t.description ?? null,
                deadline: t.deadline ?? null,
                created_at: t.createdAt ?? Date.now(),
                position: i,
              }));
              await supabase.from('tasks').upsert(taskRows);
            }

            // Remove old localStorage key so migration never runs again
            localStorage.removeItem('kanban-storage');

            // Re-fetch everything after migration
            const { data: freshCols } = await supabase
              .from('columns').select('*').order('position');
            const { data: freshTasks } = await supabase
              .from('tasks').select('*').order('position');

            set({
              columns: (freshCols ?? []).map(mapColumn),
              tasks: (freshTasks ?? []).map(mapTask),
              loading: false,
            });
            return;
          }
        }
      } catch {
        // Migration failed silently — just continue with empty board
      }
    }
    // ── end migration ──────────────────────────────────────────────────────

    set({
      columns: (cols ?? []).map(mapColumn),
      tasks: (tsks ?? []).map(mapTask),
      loading: false,
    });
  },

  // ── Column actions ────────────────────────────────────────────────────────
  addColumn: async (title) => {
    const { columns } = get();
    const newCol = { id: generateId(), title, position: columns.length };
    const { error } = await supabase.from('columns').insert(newCol);
    if (error) return;
    set((s) => ({ columns: [...s.columns, { id: newCol.id, title }] }));
  },

  deleteColumn: async (id) => {
    await supabase.from('columns').delete().eq('id', id);
    set((s) => ({
      columns: s.columns.filter((c) => c.id !== id),
      tasks: s.tasks.filter((t) => t.columnId !== id),
    }));
  },

  updateColumn: async (id, title) => {
    await supabase.from('columns').update({ title }).eq('id', id);
    set((s) => ({
      columns: s.columns.map((c) => (c.id === id ? { ...c, title } : c)),
    }));
  },

  // ── Task actions ──────────────────────────────────────────────────────────
  addTask: async (columnId, title, description, deadline) => {
    const { tasks } = get();
    const colTasks = tasks.filter((t) => t.columnId === columnId);
    const newTask = {
      id: generateId(),
      column_id: columnId as string,
      title,
      description: description ?? null,
      deadline: deadline ?? null,
      position: colTasks.length,
      created_at: Date.now(),
    };
    const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
    if (error || !data) return;
    set((s) => ({ tasks: [...s.tasks, mapTask(data)] }));
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  updateTask: async (id, title, description, deadline) => {
    await supabase.from('tasks').update({
      title,
      description: description ?? null,
      deadline: deadline ?? null,
    }).eq('id', id);
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, title, description, deadline } : t
      ),
    }));
  },

  // ── Optimistic drag-state (no DB call) ────────────────────────────────────
  setColumns: (columns) => set({ columns }),
  setTasks: (tasks) => set({ tasks }),

  // ── Sync final order to Supabase after drag ends ─────────────────────────
  syncColumnOrder: async (columns) => {
    const updates = columns.map((col, idx) => ({
      id: col.id as string,
      title: col.title,
      position: idx,
    }));
    await supabase.from('columns').upsert(updates);
  },

  syncTaskOrder: async (tasks) => {
    if (tasks.length === 0) return;
    const updates = tasks.map((t, idx) => ({
      id: t.id as string,
      column_id: t.columnId as string,
      title: t.title,
      description: t.description ?? null,
      deadline: t.deadline ?? null,
      created_at: t.createdAt ?? Date.now(),
      position: idx,
    }));
    await supabase.from('tasks').upsert(updates);
  },
}));
