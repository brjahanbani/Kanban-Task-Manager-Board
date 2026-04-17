import React, { useMemo, useState, useEffect } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2 } from 'lucide-react';
import type { Column, Task } from '../../types';
import { TaskCard } from '../TaskCard/TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import { supabase } from '../../lib/supabase';
import './Column.css';

interface ColumnProps {
  column: Column;
  tasks: Task[];
}

export const BoardColumn: React.FC<ColumnProps> = ({ column, tasks }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { addTask, deleteColumn } = useTaskStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  // Returns a datetime-local string 24h from now (the default)
  const defaultDeadline = () => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const tasksIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const isForceInProgress = column.title.toLowerCase().includes('force') &&
    column.title.toLowerCase().includes('progress');

  const getColumnTheme = (id: string): React.CSSProperties => {
    if (isForceInProgress) {
      return {
        '--col-bg': 'rgba(234, 179, 8, 0.07)',
        '--col-accent': 'rgba(234, 179, 8, 1)',
        '--task-bg': 'rgba(60, 48, 8, 0.65)',
        '--task-border': 'rgba(234, 179, 8, 0.28)',
        '--task-hover-bg': 'rgba(234, 179, 8, 0.18)',
      } as React.CSSProperties;
    }
    switch (id) {
      case 'todo':
        return {
          '--col-bg': 'rgba(59, 130, 246, 0.06)',
          '--col-accent': 'rgba(59, 130, 246, 1)',
          '--task-bg': 'rgba(30, 50, 80, 0.6)',
          '--task-border': 'rgba(59, 130, 246, 0.2)',
          '--task-hover-bg': 'rgba(59, 130, 246, 0.18)',
        } as React.CSSProperties;
      case 'in-progress':
        return {
          '--col-bg': 'rgba(239, 68, 68, 0.06)',
          '--col-accent': 'rgba(239, 68, 68, 1)',
          '--task-bg': 'rgba(80, 30, 30, 0.6)',
          '--task-border': 'rgba(239, 68, 68, 0.2)',
          '--task-hover-bg': 'rgba(239, 68, 68, 0.18)',
        } as React.CSSProperties;
      case 'done':
        return {
          '--col-bg': 'rgba(34, 197, 94, 0.06)',
          '--col-accent': 'rgba(34, 197, 94, 1)',
          '--task-bg': 'rgba(20, 60, 40, 0.6)',
          '--task-border': 'rgba(34, 197, 94, 0.2)',
          '--task-hover-bg': 'rgba(34, 197, 94, 0.18)',
        } as React.CSSProperties;
      default:
        return {
          '--col-bg': 'var(--bg-secondary)',
          '--col-accent': 'var(--accent-color)',
          '--task-bg': 'var(--bg-elevated)',
          '--task-border': 'var(--bg-tertiary)',
          '--task-hover-bg': 'var(--bg-elevated)',
        } as React.CSSProperties;
    }
  };

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    ...getColumnTheme(column.id as string),
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const deadlineMs = newTaskDeadline
        ? new Date(newTaskDeadline).getTime()
        : undefined;
      addTask(column.id, newTaskTitle, newTaskDesc, deadlineMs, userId);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDeadline('');
      setIsAddingTask(false);
    }
  };

  const handleCancelAdd = () => {
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDeadline('');
    setIsAddingTask(false);
  };

  // Stop ALL keyboard events inside the form from bubbling to dnd-kit
  const stopKeys = (e: React.KeyboardEvent) => e.stopPropagation();

  return (
    <div ref={setNodeRef} style={style} className="board-column">
      {/* Column header — drag handle */}
      <div className="column-header" {...attributes} {...listeners}>
        <div className="column-accent-bar" />
        <div className="column-title-container">
          <h2 className={`column-title${isForceInProgress ? ' column-title-warning' : ''}`}>
            {isForceInProgress && <span className="col-warning-icon">⚠</span>}
            {column.title}
          </h2>
          <span className="column-task-count">{tasks.length}</span>
        </div>
        <button
          className="icon-btn danger col-delete-btn"
          onClick={() => deleteColumn(column.id)}
          title="Delete column"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* ── Scrollable task list ── */}
      <div className="column-content">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} showWarning={isForceInProgress} />
          ))}
        </SortableContext>
      </div>

      {/* ── Sticky footer: always visible, never scrolls away ── */}
      <div className="column-footer" onPointerDown={(e) => e.stopPropagation()}>
        {isAddingTask ? (
          <div className="add-task-container">
            <input
              autoFocus
              className="add-task-input"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={stopKeys}
            />
            <textarea
              className="add-task-textarea"
              placeholder="Description (optional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              onKeyDown={stopKeys}
            />
            <div className="deadline-field">
              <label className="deadline-label">⏰ Deadline</label>
              <input
                type="datetime-local"
                className="add-task-input deadline-input"
                value={newTaskDeadline || defaultDeadline()}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                onKeyDown={stopKeys}
              />
              <button
                className="clear-deadline-btn"
                onClick={() => setNewTaskDeadline('')}
                title="Remove deadline"
              >
                No deadline
              </button>
            </div>
            <div className="add-task-actions">
              <button className="footer-btn primary" onClick={handleAddTask}>
                Add task
              </button>
              <button className="footer-btn ghost" onClick={handleCancelAdd}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add-task-btn" onClick={() => setIsAddingTask(true)}>
            <Plus size={15} />
            <span>Add task</span>
          </button>
        )}
      </div>
    </div>
  );
};
