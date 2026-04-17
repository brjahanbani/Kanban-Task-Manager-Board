import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { BoardColumn } from '../Column/Column';
import { TaskCard } from '../TaskCard/TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import type { Column, Task } from '../../types';
import './Board.css';

export const Board: React.FC = () => {
  const { columns, tasks, setColumns, setTasks, addColumn } = useTaskStore();
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;

    if (data.current?.type === 'Column') {
      setActiveColumn(data.current.column);
      return;
    }

    if (data.current?.type === 'Task') {
      setActiveTask(data.current.task);
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      let newTasks = [...tasks];

      // Move task to a different column
      if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          columnId: tasks[overIndex].columnId,
        };
        setTasks(arrayMove(newTasks, activeIndex, overIndex));
        return;
      }

      setTasks(arrayMove(newTasks, activeIndex, overIndex));
    }

    // Dropping a task over an empty column
    if (isActiveTask && isOverColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      let newTasks = [...tasks];

      newTasks[activeIndex] = {
        ...newTasks[activeIndex],
        columnId: overId,
      };

      setTasks(arrayMove(newTasks, activeIndex, activeIndex));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle Column dragging
    if (active.data.current?.type === 'Column') {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);
      setColumns(arrayMove(columns, activeColumnIndex, overColumnIndex));
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="board-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns-wrapper">
          <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
            {columns.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
              />
            ))}
          </SortableContext>

          {/* Add New Column */}
          <div className="add-column-wrapper">
            {isAddingColumn ? (
              <div className="add-column-input-container">
                <input
                  autoFocus
                  type="text"
                  placeholder="Column title..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                  }}
                />
                <div className="add-column-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleAddColumn}>
                    Add
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsAddingColumn(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="add-column-btn" onClick={() => setIsAddingColumn(true)}>
                <Plus size={20} />
                <span>Add Column</span>
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeColumn && (
            <BoardColumn
              column={activeColumn}
              tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
            />
          )}
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
