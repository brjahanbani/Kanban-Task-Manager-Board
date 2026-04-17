import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import type { Task } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  showWarning?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, showWarning = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const { deleteTask, updateTask } = useTaskStore();

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
      updateTask(task.id, editTitle, editDesc);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setIsEditing(false);
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="task-card task-card-dragging" />;
  }

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
            onKeyDown={(e) => {
              // Prevent ALL keyboard events from reaching dnd-kit
              e.stopPropagation();
            }}
          />
          <textarea
            className="task-edit-desc"
            placeholder="Description (optional)"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            onKeyDown={(e) => {
              // Prevent ALL keyboard events from reaching dnd-kit
              e.stopPropagation();
            }}
          />
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task-card"
      {...attributes}
      {...listeners}
    >
      <div className="task-card-content">
        {showWarning && (
          <div className="task-warning-badge" title="Force In Progress — handle with care!">
            <span className="warning-triangle">⚠</span>
            <span className="warning-label">Force In Progress</span>
          </div>
        )}
        <h3 className="task-title">{task.title}</h3>
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
      </div>

      {/* Action buttons — stop pointer events from triggering drag */}
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
