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
  const {
    columns, tasks,
    setColumns, setTasks,
    addColumn,
    syncColumnOrder, syncTaskOrder,
  } = useTaskStore();

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.type === 'Column') { setActiveColumn(data.current.column); return; }
    if (data.current?.type === 'Task')   { setActiveTask(data.current.task);   return; }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask  = active.data.current?.type === 'Task';
    const isOverTask    = over.data.current?.type === 'Task';
    const isOverColumn  = over.data.current?.type === 'Column';
    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex   = tasks.findIndex((t) => t.id === overId);
      let newTasks = [...tasks];
      if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
        newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: tasks[overIndex].columnId };
      }
      setTasks(arrayMove(newTasks, activeIndex, overIndex));
    }

    if (isActiveTask && isOverColumn) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const newTasks = [...tasks];
      newTasks[activeIndex] = { ...newTasks[activeIndex], columnId: overId };
      setTasks(arrayMove(newTasks, activeIndex, activeIndex));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId   = over.id;

    if (active.data.current?.type === 'Column') {
      if (activeId === overId) return;
      const activeIndex = columns.findIndex((col) => col.id === activeId);
      const overIndex   = columns.findIndex((col) => col.id === overId);
      const newCols = arrayMove(columns, activeIndex, overIndex);
      setColumns(newCols);
      syncColumnOrder(newCols);   // ← persist to Supabase
    }

    if (active.data.current?.type === 'Task') {
      // Tasks were already reordered optimistically in handleDragOver
      syncTaskOrder(tasks);       // ← persist final order to Supabase
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
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); }}
                />
                <div className="add-column-actions">
                  <button className="footer-btn primary" onClick={handleAddColumn}>Add</button>
                  <button className="footer-btn ghost" onClick={() => setIsAddingColumn(false)}>Cancel</button>
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
