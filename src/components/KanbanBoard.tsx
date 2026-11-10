import React, { useState, useRef } from 'react';
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
  const { preferences, effectiveTheme, getRoundedClass, isLiquidGlass } = useSettings();
  const isLight = effectiveTheme === 'light';

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const activeDragTaskIdRef = useRef<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState<TaskStatus | 'all'>('all');

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTaskId(task.id);
    activeDragTaskIdRef.current = task.id;
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
    const textData = e.dataTransfer.getData('text/plain');
    const taskId = textData || draggedTaskId || activeDragTaskIdRef.current;
    if (taskId) {
      moveTaskStatus(taskId, status);
    }
    setDraggedTaskId(null);
    activeDragTaskIdRef.current = null;
  };

  const getColumnIcon = (id: TaskStatus) => {
    switch (id) {
      case 'todo':
        return <ListTodo className="w-4 h-4 text-[#FF9500]" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-[#007AFF]" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-[#34C759]" />;
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
      isLiquidGlass 
        ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,122,255,0.18),rgba(255,255,255,0)),radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(175,82,222,0.16),rgba(255,255,255,0)),radial-gradient(circle_at_20%_80%,rgba(0,210,255,0.12),transparent),#050814]'
        : isLight 
        ? 'bg-[#f5f5f7]' 
        : 'bg-[#000000]'
    }`}>
      {/* Mobile Segmented Control Tab Bar (Apple HIG) */}
      <div className="md:hidden flex items-center justify-between gap-1 mb-3 p-1 rounded-full border bg-black/20 dark:bg-white/10 border-white/10 text-xs font-semibold overflow-x-auto backdrop-blur-md">
        <button
          onClick={() => setMobileActiveColumn('all')}
          className={`flex-1 py-1.5 px-3 rounded-full text-center transition-all cursor-pointer whitespace-nowrap ${
            mobileActiveColumn === 'all'
              ? 'bg-[#007AFF] text-white shadow-xs font-semibold'
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
              className={`flex-1 py-1.5 px-3 rounded-full text-center transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-1.5 ${
                isSelected
                  ? 'bg-[#007AFF] text-white shadow-xs font-semibold'
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
              className={`flex flex-col h-full max-h-full ${containerRounded} border transition-all duration-200 overflow-hidden shadow-sm relative ${
                isLiquidGlass
                  ? 'apple-liquid-glass border-white/20 hover:border-white/30 text-white'
                  : isLight 
                  ? 'bg-[#f1f3f4]/95 border-slate-200 hover:border-slate-300' 
                  : `${col.columnBg} border-white/10 hover:border-white/15`
              } ${isOver ? col.borderActive : ''}`}
            >
              {/* Specular Edge Highlight for iOS 27 Liquid Glass */}
              {isLiquidGlass && (
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-10" />
              )}

              {/* Column Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 z-10 ${
                isLiquidGlass
                  ? 'bg-white/5 border-white/15 backdrop-blur-xl'
                  : isLight 
                  ? 'bg-white/90 border-slate-200' 
                  : `border-white/10 bg-gradient-to-r ${col.headerGradient}`
              }`}>
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-xl flex items-center justify-center border shadow-xs ${
                    isLiquidGlass
                      ? 'bg-white/10 border-white/20'
                      : isLight ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/10'
                  }`}>
                    {getColumnIcon(col.id)}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-tight flex items-center space-x-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      <span>{col.label}</span>
                      <span 
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center space-x-1 ${
                          isLiquidGlass
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                            : col.badgeClass
                        }`}
                        title="Nombre de tâches actuelles et capacité infinie"
                      >
                        <span>{colTasks.length}</span>
                        <span className="opacity-60">/</span>
                        <span className="font-bold text-xs" title="Capacité infinie de tâches">∞</span>
                      </span>
                    </h3>
                    <p className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {col.description}
                    </p>
                  </div>
                </div>

                {/* Quick Add Button Header (Always accessible, no matter how many tasks exist) */}
                <button
                  onClick={() => onOpenNewTaskModalForStatus(col.id)}
                  style={{ color: isLiquidGlass ? '#38bdf8' : col.accentColor }}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center space-x-1 ${
                    isLiquidGlass
                      ? 'bg-white/10 hover:bg-white/20 border-white/20 shadow-xs'
                      : isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' 
                      : 'bg-white/5 hover:bg-white/15 border-white/10'
                  }`}
                  title={`Ajouter une tâche dans "${col.label}" (Capacité infinie ∞)`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sticky In-Column Quick Action Bar (Ensures adding tasks is instant from top) */}
              <div className={`px-3 py-1.5 border-b flex items-center justify-between text-[11px] shrink-0 ${
                isLiquidGlass
                  ? 'bg-black/20 border-white/10 text-slate-300'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-black/20 border-white/5 text-slate-400'
              }`}>
                <button
                  onClick={() => onOpenNewTaskModalForStatus(col.id)}
                  className="flex items-center space-x-1.5 text-xs font-medium hover:text-white transition-colors cursor-pointer group"
                >
                  <Plus className="w-3.5 h-3.5 text-[#007AFF] group-hover:scale-110 transition-transform" />
                  <span className={isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'}>
                    + Ajouter une tâche
                  </span>
                </button>
                <span 
                  className="text-[10px] font-mono opacity-70 flex items-center space-x-1"
                  title="Cette colonne accepte un nombre illimité de tâches avec défilement fluide"
                >
                  <span>Capacité</span>
                  <span className="font-bold text-xs text-[#007AFF]">∞</span>
                </span>
              </div>

              {/* Tasks List / Drop Zone (Infinite capacity with smooth Apple scrollbar) */}
              <div className="flex-1 min-h-0 p-2.5 space-y-2 overflow-y-auto overscroll-contain pr-1.5 apple-scroll">
                {colTasks.length === 0 ? (
                  <div className={`h-40 border-2 border-dashed ${containerRounded} flex flex-col items-center justify-center p-3 text-center transition-all ${
                    isOver 
                      ? 'border-[#007AFF] bg-[#007AFF]/10' 
                      : isLiquidGlass
                      ? 'border-white/15 text-slate-400'
                      : isLight ? 'border-slate-300 text-slate-400' : 'border-white/10 text-slate-500'
                  }`}>
                    <div className={`p-2 rounded-full mb-1.5 ${isLiquidGlass ? 'bg-white/10' : isLight ? 'bg-slate-200' : 'bg-white/5'}`}>
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
                      className={`mt-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1 apple-btn-active ${
                        isLiquidGlass
                          ? 'bg-[#007AFF] hover:bg-[#0062cc] text-white shadow-md shadow-[#007AFF]/30'
                          : isLight 
                          ? 'bg-white hover:bg-slate-100 text-slate-800 border border-black/10 shadow-xs' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter une tâche</span>
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

                    {/* Bottom Infinite Status & Add Button */}
                    <div className="pt-2 pb-1 space-y-2">
                      <button
                        onClick={() => onOpenNewTaskModalForStatus(col.id)}
                        className={`w-full py-2.5 border border-dashed rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer group apple-btn-active ${
                          isLiquidGlass
                            ? 'border-white/20 hover:border-cyan-400/50 hover:bg-white/10 text-slate-300 hover:text-white'
                            : isLight 
                            ? 'border-slate-300 hover:border-black/20 hover:bg-white text-slate-600 hover:text-slate-900' 
                            : 'border-white/15 hover:border-white/30 hover:bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 group-hover:text-[#007AFF] transition-colors" />
                        <span>Ajouter une tâche (∞ Illimité)</span>
                      </button>

                      <div className="text-center text-[10px] text-slate-400 flex items-center justify-center space-x-1 opacity-70">
                        <span>{colTasks.length} tâche{colTasks.length > 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span className="font-medium text-[#007AFF]">Capacité infinie (∞)</span>
                      </div>
                    </div>
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
