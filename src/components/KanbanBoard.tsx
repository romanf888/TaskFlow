import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, ListTodo, Sparkles } from 'lucide-react';
import { Task, TaskStatus, STATUS_COLUMNS } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
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
  const { preferences, effectiveTheme, getRoundedClass } = useSettings();
  const isLight = effectiveTheme === 'light';

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<TaskStatus | 'all'>('all');

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
        return <ListTodo className="w-4 h-4 text-[#FBBC04]" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-[#4285F4]" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-[#34A853]" />;
    }
  };

  const containerRounded = getRoundedClass('container');

  // Sort tasks according to user preference
  const getSortedTasks = (taskList: Task[]) => {
    if (preferences.defaultSort === 'priority') {
      const weight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return [...taskList].sort((a, b) => (weight[b.priority || 'medium'] || 0) - (weight[a.priority || 'medium'] || 0));
    }
    if (preferences.defaultSort === 'date-desc') {
      return [...taskList].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    if (preferences.defaultSort === 'date-asc') {
      return [...taskList].sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    return taskList; // manual default
  };

  return (
    <div className={`flex-1 p-2.5 sm:p-4 md:p-5 overflow-x-auto min-h-0 select-none ${
      isLight ? 'bg-[#f8f9fa]' : 'bg-[#131314]'
    }`}>
      {/* Mobile Segmented Column Tabs Bar (Visible only on phone/small screens) */}
      <div className="md:hidden flex items-center justify-between gap-1 mb-3 p-1 rounded-2xl border bg-black/20 dark:bg-white/5 border-white/10 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setMobileActiveColumn('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer whitespace-nowrap ${
            mobileActiveColumn === 'all'
              ? 'bg-[#4285F4] text-white shadow-xs font-bold'
              : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          Toutes ({tasks.length})
        </button>

        {STATUS_COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          const isSelected = mobileActiveColumn === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setMobileActiveColumn(col.id)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-1 ${
                isSelected
                  ? 'bg-[#4285F4] text-white shadow-xs font-bold'
                  : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{col.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-black/20 dark:bg-white/10 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto h-full md:min-w-[760px] pb-6">
        {STATUS_COLUMNS.filter(col => mobileActiveColumn === 'all' || mobileActiveColumn === col.id).map((col) => {
          const colTasks = getSortedTasks(tasks.filter((t) => t.status === col.id));
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col ${containerRounded} border transition-all duration-200 overflow-hidden shadow-sm ${
                isLight 
                  ? 'bg-[#f1f3f4]/95 border-slate-200 hover:border-slate-300' 
                  : `${col.columnBg} border-white/10 hover:border-white/15`
              } ${isOver ? col.borderActive : ''}`}
            >
              {/* Google Column Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isLight 
                  ? 'bg-white/90 border-slate-200' 
                  : `border-white/10 bg-gradient-to-r ${col.headerGradient}`
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-xl flex items-center justify-center border shadow-xs ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'
                  }`}>
                    {getColumnIcon(col.id)}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-tight flex items-center space-x-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <span>{col.label}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${col.badgeClass}`}>
                        {colTasks.length}
                      </span>
                    </h3>
                    <p className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {col.description}
                    </p>
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => onOpenNewTaskModalForStatus(col.id)}
                  style={{ color: col.accentColor }}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-white/5 hover:bg-white/15 border-white/10'
                  }`}
                  title={`Ajouter une tâche dans "${col.label}"`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List / Drop Zone (Compact Spacing to show many tasks) */}
              <div className="flex-1 p-2.5 space-y-2 overflow-y-auto min-h-[300px]">
                {colTasks.length === 0 ? (
                  <div className={`h-40 border-2 border-dashed ${containerRounded} flex flex-col items-center justify-center p-3 text-center transition-all ${
                    isOver 
                      ? 'border-[#4285F4] bg-[#4285F4]/10' 
                      : isLight ? 'border-slate-300 text-slate-400' : 'border-white/10 text-slate-500'
                  }`}>
                    <div className={`p-2 rounded-full mb-1.5 ${isLight ? 'bg-slate-200' : 'bg-white/5'}`}>
                      {getColumnIcon(col.id)}
                    </div>
                    <p className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                      Aucune tâche dans "{col.label}"
                    </p>
                    <p className={`text-[10.5px] mt-0.5 max-w-[190px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Glissez une carte ici ou créez une tâche.
                    </p>
                    <button
                      onClick={() => onOpenNewTaskModalForStatus(col.id)}
                      className={`mt-2 px-3 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
                        isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
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

                    {/* Bottom Add Button */}
                    <button
                      onClick={() => onOpenNewTaskModalForStatus(col.id)}
                      className={`w-full py-2 border border-dashed rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer group ${
                        isLight 
                          ? 'border-slate-300 hover:border-slate-400 hover:bg-white text-slate-500 hover:text-slate-800' 
                          : 'border-white/15 hover:border-white/30 hover:bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 group-hover:text-[#4285F4] transition-colors" />
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
