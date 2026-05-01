import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useCountdown } from '../../hooks/useCountdown';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  showWarning?: boolean;
  isDoneColumn?: boolean;
}

/** Convert a Unix-ms timestamp → 'YYYY-MM-DDTHH:mm' for datetime-local inputs */
function toDatetimeLocal(ms: number): string {
  const d = new Date(ms);
  // Adjust to local time offset so the input shows local time
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(ms - tzOffset).toISOString().slice(0, 16);
}

/** Default deadline: 24 h from now */
function defaultDeadlineValue(): string {
  return toDatetimeLocal(Date.now() + 24 * 60 * 60 * 1000);
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, showWarning = false, isDoneColumn = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editDeadline, setEditDeadline] = useState(
    task.deadline ? toDatetimeLocal(task.deadline) : ''
  );
  const { deleteTask, updateTask } = useTaskStore();
  const countdown = useCountdown(task.deadline);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      const deadlineMs = editDeadline ? new Date(editDeadline).getTime() : undefined;
      updateTask(task.id, editTitle, editDesc, deadlineMs);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditDeadline(task.deadline ? toDatetimeLocal(task.deadline) : '');
    setIsEditing(false);
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="task-card task-card-dragging" />;
  }

  // ── Edit mode ──────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="task-card task-card-editing">
        <div className="task-edit-mode">
          <input
            autoFocus
            className="task-edit-title"
            placeholder="Task title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          />
          {!isDoneColumn && (
            <>
              <textarea
                className="task-edit-desc"
                placeholder="Description (optional)"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />

              {/* Deadline editor */}
              <div className="task-edit-deadline-section">
                <label className="deadline-edit-label">⏰ Deadline</label>
                <input
                  type="datetime-local"
                  className="task-edit-datetime"
                  value={editDeadline || defaultDeadlineValue()}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <button
                  className="clear-deadline-btn"
                  onClick={() => setEditDeadline('')}
                >
                  Remove deadline
                </button>
              </div>
            </>
          )}

          <div className="task-edit-actions">
            <button className="icon-btn success" onClick={handleSave} title="Save">
              <Check size={15} />
            </button>
            <button className="icon-btn" onClick={handleCancel} title="Cancel">
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── View mode ──────────────────────────────────────────────────
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card${countdown?.expired ? ' task-card-expired' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-content">
        {/* Force-In-Progress warning badge */}
        {showWarning && (
          <div className="task-warning-badge" title="Force In Progress — handle with care!">
            <span className="warning-triangle">⚠</span>
            <span className="warning-label">Force In Progress</span>
          </div>
        )}

        <h3 className="task-title">{task.title}</h3>
        {!isDoneColumn && task.description && <p className="task-desc">{task.description}</p>}
      </div>

      {/* Deadline display */}
      {!isDoneColumn && task.deadline && (
        <div className={`task-deadline${countdown?.expired ? ' task-deadline-expired' : ''}`}>
          {countdown?.expired ? (
            <>
              <span className="deadline-icon">🔴</span>
              <span className="deadline-expired-text">Deadline is already ended.</span>
            </>
          ) : (
            <>
              <span className="deadline-icon">⏱</span>
              <span className="deadline-remaining">{countdown?.label} remaining</span>
            </>
          )}
        </div>
      )}

      {/* Hover actions */}
      <div className="task-actions" onPointerDown={(e) => e.stopPropagation()}>
        <button className="icon-btn" onClick={() => setIsEditing(true)} title="Edit">
          <Edit2 size={14} />
        </button>
        <button className="icon-btn danger" onClick={() => deleteTask(task.id)} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
