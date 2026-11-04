import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { Task, TaskStatus, STATUS_COLUMNS } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  onOpenTaskDetails: (task: Task) => void;
  onOpenNewTaskModalForStatus: (status: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onOpenTaskDetails,
  onOpenNewTaskModalForStatus,
}) => {
  const { tasks, moveTaskStatus } = useTaskContext();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, status);
    }
    setDraggedTaskId(null);
  };

  const getColumnIcon = (id: TaskStatus) => {
    switch (id) {
      case 'todo':
        return <ListTodo className="w-4 h-4 text-amber-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-x-auto min-h-0 bg-[#0c0e15] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.08),rgba(255,255,255,0))]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto h-full min-w-[760px] pb-6">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden shadow-xl ${col.columnBg} ${
                isOver ? col.borderActive : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Column Header with rich vibrant gradient */}
              <div className={`p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r ${col.headerGradient}`}>
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-xl bg-black/40 shadow-inner flex items-center justify-center border border-white/10"
                  >
                    {getColumnIcon(col.id)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
                      <span>{col.label}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs ${col.badgeClass}`}>
                        {colTasks.length}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {col.description}
                    </p>
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => onOpenNewTaskModalForStatus(col.id)}
                  style={{ color: col.accentColor }}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-white/15 border border-white/10 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title={`Ajouter une tâche dans "${col.label}"`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List / Drop Zone */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto min-h-[300px]">
                {colTasks.length === 0 ? (
                  <div className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all ${
                    isOver 
                      ? 'border-blue-400/80 bg-blue-500/10' 
                      : 'border-white/10 text-slate-500 hover:border-white/20'
                  }`}>
                    <div className="p-2.5 rounded-full bg-white/5 mb-2">
                      {getColumnIcon(col.id)}
                    </div>
                    <p className="text-xs font-semibold text-slate-300">
                      Aucune tâche dans "{col.label}"
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                      Glissez une tâche ici ou cliquez sur le bouton pour en ajouter une.
                    </p>
                    <button
                      onClick={() => onOpenNewTaskModalForStatus(col.id)}
                      className="mt-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpenDetails={onOpenTaskDetails}
                        onDragStart={handleDragStart}
                      />
                    ))}

                    {/* Quick Add Button at bottom of column */}
                    <button
                      onClick={() => onOpenNewTaskModalForStatus(col.id)}
                      className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/30 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer group"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      <span>Ajouter une tâche</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
