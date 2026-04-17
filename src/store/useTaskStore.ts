import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column, Id, Task } from '../types';
import { generateId } from '../utils';

interface TaskState {
  columns: Column[];
  tasks: Task[];
  
  // Actions
  addColumn: (title: string) => void;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;
  
  addTask: (columnId: Id, title: string, description?: string) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, title: string, description?: string) => void;
  
  // Drag and Drop updates
  setColumns: (columns: Column[]) => void;
  setTasks: (tasks: Task[]) => void;
}

const defaultCols: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      columns: defaultCols,
      tasks: [],
      
      addColumn: (title) => 
        set((state) => ({
          columns: [...state.columns, { id: generateId(), title }]
        })),
        
      deleteColumn: (id) => 
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id),
          tasks: state.tasks.filter((task) => task.columnId !== id)
        })),
        
      updateColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((col) => 
            col.id === id ? { ...col, title } : col
          )
        })),
        
      addTask: (columnId, title, description) =>
        set((state) => ({
          tasks: [...state.tasks, { 
            id: generateId(), 
            columnId, 
            title, 
            description,
            commentsCount: Math.floor(Math.random() * 5), // Mock data for UI
            attachmentsCount: Math.floor(Math.random() * 3), // Mock data for UI
            createdAt: Date.now() 
          }]
        })),
        
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        })),
        
      updateTask: (id, title, description) =>
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id ? { ...task, title, description } : task
          )
        })),
        
      setColumns: (columns) => set({ columns }),
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'kanban-storage',
    }
  )
);
