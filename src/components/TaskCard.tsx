import React from 'react';
import { 
  CheckSquare, 
  Image as ImageIcon, 
  Tag, 
  ChevronRight, 
  ChevronLeft, 
  GripVertical,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Task, TaskStatus } from '../types/task';
import { useTaskContext } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onOpenDetails: (task: Task) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onOpenDetails, 
  onDragStart 
}) => {
  const { moveTaskStatus, categories } = useTaskContext();

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Find category badge class
  const categoryDef = categories.find((c) => c.name === task.category);
  const categoryBadgeClass = categoryDef ? categoryDef.badgeClass : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  // Priority color and border
  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          leftBar: '#ef4444',
          label: 'Urgente',
        };
      case 'high':
        return {
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          leftBar: '#f97316',
          label: 'Haute',
        };
      case 'medium':
        return {
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          leftBar: '#3b82f6',
          label: 'Moyenne',
        };
      case 'low':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          leftBar: '#10b981',
          label: 'Basse',
        };
      default:
        return {
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          leftBar: '#64748b',
          label: 'Normale',
        };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  const handleNextStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'todo') moveTaskStatus(task.id, 'in_progress');
    else if (task.status === 'in_progress') moveTaskStatus(task.id, 'done');
  };

  const handlePrevStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'done') moveTaskStatus(task.id, 'in_progress');
    else if (task.status === 'in_progress') moveTaskStatus(task.id, 'todo');
  };

  // Color generator for tags
  const getTagColorClass = (tag: string) => {
    const colors = [
      'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      'bg-pink-500/15 text-pink-300 border-pink-500/30',
      'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      'bg-amber-500/15 text-amber-300 border-amber-500/30',
      'bg-purple-500/15 text-purple-300 border-purple-500/30',
      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash += tag.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpenDetails(task)}
      style={{ borderLeftColor: priorityStyle.leftBar }}
      className={`group relative bg-[#1c2132] hover:bg-[#23293e] border border-white/10 hover:border-white/20 border-l-4 rounded-xl p-3.5 text-slate-200 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.99] select-none ${
        task.status === 'done' ? 'opacity-85' : ''
      }`}
    >
      {/* Top row: Category, Priority badge, Screenshot indicator & Grip */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {task.category && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryBadgeClass}`}>
              {task.category}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${priorityStyle.badge}`}>
            {priorityStyle.label}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          {task.screenshotUrl && (
            <span 
              className="p-1 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30"
              title="Cette tâche contient une capture d'écran / illustration"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </span>
          )}
          <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </div>

      {/* Task Title */}
      <h4 className={`text-sm font-semibold tracking-tight leading-snug mb-1.5 transition-colors ${
        task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-white'
      }`}>
        {task.title}
      </h4>

      {/* Task Description excerpt */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Screenshot Thumbnail Preview if available */}
      {task.screenshotUrl && (
        <div className="mb-2 rounded-lg overflow-hidden border border-white/15 max-h-24 bg-black/40 flex items-center justify-center shadow-inner">
          <img 
            src={task.screenshotUrl} 
            alt="Illustration aperçu" 
            className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center space-x-1">
              <CheckSquare className="w-3 h-3 text-emerald-400" />
              <span>Sous-tâches</span>
            </span>
            <span className="font-semibold text-slate-300">
              {completedSubtasks}/{totalSubtasks} <span className="text-blue-400">({subtasksPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                subtasksPercent === 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${subtasksPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Colorful Tags Chips */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 pt-1">
          {task.tags.map((tag) => (
            <span 
              key={tag}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getTagColorClass(tag)}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer & Quick Navigation Buttons */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[11px] text-slate-400">
        <span className="text-[10px] text-slate-500 group-hover:text-blue-400 transition-colors">
          Cliquer pour ouvrir les détails
        </span>

        {/* Quick Shift buttons */}
        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {task.status !== 'todo' && (
            <button
              onClick={handlePrevStatus}
              className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
              title="Déplacer vers la colonne précédente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {task.status !== 'done' && (
            <button
              onClick={handleNextStatus}
              className="p-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white transition-colors"
              title="Déplacer vers la colonne suivante"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
