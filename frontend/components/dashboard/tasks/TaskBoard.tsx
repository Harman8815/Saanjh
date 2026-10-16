'use client';

import { useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, TaskBoard as TaskBoardData, TaskStatus } from '@/types/api';

interface TaskBoardProps {
  board?: TaskBoardData;
  isLoading: boolean;
  onStatusChange: (task: Task, status: TaskStatus) => Promise<void>;
}

export function TaskBoard({ board, isLoading, onStatusChange }: TaskBoardProps) {
  const [optimisticBoard, setOptimisticBoard] = useState<{
    source: TaskBoardData['columns'];
    columns: TaskBoardData['columns'];
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const columns = optimisticBoard?.source === board?.columns && optimisticBoard
    ? optimisticBoard.columns
    : board?.columns || [];

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) return;
    const previous = columns;
    const sourceIndex = columns.findIndex(column => String(column.task_status.id) === result.source.droppableId);
    const destinationIndex = columns.findIndex(column => String(column.task_status.id) === result.destination?.droppableId);
    if (sourceIndex < 0 || destinationIndex < 0) return;

    const taskIndex = columns[sourceIndex].tasks.findIndex(task => String(task.id) === result.draggableId);
    if (taskIndex < 0) return;
    const task = columns[sourceIndex].tasks[taskIndex];
    const destinationStatus = columns[destinationIndex].task_status;
    const next = columns.map((column, index) => {
      if (index === sourceIndex) {
        return { ...column, count: column.count - 1, tasks: column.tasks.filter(item => item.id !== task.id) };
      }
      if (index === destinationIndex) {
        const moved = { ...task, status: destinationStatus, status_name: destinationStatus.name };
        const tasks = [...column.tasks];
        tasks.splice(result.destination!.index, 0, moved);
        return { ...column, count: column.count + 1, tasks };
      }
      return column;
    });

    setSaveError(null);
    setOptimisticBoard({ source: board?.columns || [], columns: next });
    try {
      await onStatusChange(task, destinationStatus);
    } catch {
      setOptimisticBoard({ source: board?.columns || [], columns: previous });
      setSaveError('The task status could not be saved. The board has been restored.');
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-text-secondary">Loading board…</div>;
  }

  if (!board?.selected_category) {
    return <div className="py-16 text-center text-text-secondary">Choose a category to open its task board.</div>;
  }

  return (
    <section aria-label={`${board.selected_category.name} task board`}>
      {saveError && <p role="alert" className="mb-4 text-sm text-red-400">{saveError}</p>}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map(column => (
            <Droppable key={column.task_status.id} droppableId={String(column.task_status.id)}>
              {(dropProvided, snapshot) => (
                <section
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  className={`min-h-64 min-w-64 border-t-2 bg-white/[0.035] p-3 ${snapshot.isDraggingOver ? 'bg-white/[0.08]' : ''}`}
                  style={{ borderTopColor: column.task_status.color }}
                >
                  <header className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-text-primary">{column.task_status.name}</h2>
                    <span className="text-sm text-text-secondary">{column.count}</span>
                  </header>
                  <div className="space-y-2">
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <article
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`border border-white/10 bg-[#1a1a22] p-3 ${dragSnapshot.isDragging ? 'shadow-xl ring-1 ring-primary/60' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <span {...dragProvided.dragHandleProps} aria-label={`Move ${task.title}`} className="mt-0.5 cursor-grab text-text-secondary active:cursor-grabbing">
                                <GripVertical className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <h3 className="break-words text-sm font-medium text-text-primary">{task.title}</h3>
                                <p className="mt-1 text-xs text-text-secondary">{task.priority_name}</p>
                                {task.due_date && (
                                  <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(task.due_date), 'MMM d')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </article>
                        )}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                  </div>
                </section>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}