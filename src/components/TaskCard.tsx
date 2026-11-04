import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Image as ImageIcon, 
  Tag, 
  GripVertical,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Task, TaskStatus } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';

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
  const { moveTaskStatus, categories, updateTask } = useTaskContext();
  const { preferences, getRoundedClass } = useSettings();

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const subtasksPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Find category badge class
  const categoryDef = categories.find((c) => c.name === task.category);
  const categoryBadgeClass = categoryDef ? categoryDef.badgeClass : 'bg-[#4285F4]/20 text-[#8ab4f8] border-[#4285F4]/30';

  // Google Priority Pill Style
  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return {
          badge: 'bg-[#EA4335]/20 text-[#f28b82] border-[#EA4335]/40',
          dot: '#EA4335',
          label: 'Urgente',
        };
      case 'high':
        return {
          badge: 'bg-[#FBBC04]/20 text-[#fdd663] border-[#FBBC04]/40',
          dot: '#FBBC04',
          label: 'Haute',
        };
      case 'medium':
        return {
          badge: 'bg-[#4285F4]/20 text-[#8ab4f8] border-[#4285F4]/40',
          dot: '#4285F4',
          label: 'Moyenne',
        };
      case 'low':
        return {
          badge: 'bg-[#34A853]/20 text-[#81c995] border-[#34A853]/40',
          dot: '#34A853',
          label: 'Basse',
        };
      default:
        return {
          badge: 'bg-white/10 text-slate-300 border-white/20',
          dot: '#9aa0a6',
          label: 'Normale',
        };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  // Quick 1-click completion toggle (Google Tasks style)
  const handleQuickToggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'done') {
      moveTaskStatus(task.id, 'todo');
    } else {
      moveTaskStatus(task.id, 'done');
    }
  };

  const cardRounded = getRoundedClass('card');
  const isCompact = preferences.density === 'compact';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpenDetails(task)}
      className={`group relative bg-[#282a2d] hover:bg-[#323639] border border-white/10 hover:border-white/20 ${cardRounded} ${
        isCompact ? 'p-2.5' : 'p-3.5'
      } text-slate-200 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.99] select-none ${
        task.status === 'done' ? 'opacity-70' : ''
      }`}
    >
      {/* Top row: Priority Chip, Category, and Drag Grip */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {/* Priority pill with Google dot */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex items-center space-x-1 ${priorityStyle.badge}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priorityStyle.dot }} />
            <span>{priorityStyle.label}</span>
          </span>

          {task.category && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${categoryBadgeClass}`}>
              {task.category}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          {task.screenshotUrl && preferences.showImageThumbnails && (
            <span 
              className="p-1 rounded-full bg-[#4285F4]/15 text-[#8ab4f8]"
              title="Illustration jointe"
            >
              <ImageIcon className="w-3 h-3" />
            </span>
          )}
          <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>

      {/* Title with Google Tasks circular checkbox */}
      <div className="flex items-start space-x-2.5 mb-1.5">
        <button
          onClick={handleQuickToggleDone}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-[#34A853] transition-colors cursor-pointer"
          title={task.status === 'done' ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
        >
          {task.status === 'done' ? (
            <CheckCircle className="w-4 h-4 text-[#34A853] fill-[#34A853]/20" />
          ) : (
            <Circle className="w-4 h-4 hover:border-[#34A853]" />
          )}
        </button>

        <h4 className={`text-xs font-semibold tracking-tight leading-snug transition-colors flex-1 ${
          task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-100 group-hover:text-white'
        }`}>
          {task.title}
        </h4>
      </div>

      {/* Description excerpt */}
      {task.description && !isCompact && (
        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 ml-6 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Screenshot Thumbnail Preview if enabled in preferences */}
      {task.screenshotUrl && preferences.showImageThumbnails && !isCompact && (
        <div className="mb-2 ml-6 rounded-xl overflow-hidden border border-white/10 max-h-24 bg-black/40 flex items-center justify-center">
          <img 
            src={task.screenshotUrl} 
            alt="Aperçu" 
            className="w-full h-24 object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}

      {/* Subtasks Progress if enabled in preferences */}
      {totalSubtasks > 0 && preferences.showSubtaskProgress && (
        <div className="pt-1.5 border-t border-white/5 ml-6">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="font-medium">Sous-tâches</span>
            <span className="font-semibold text-slate-300">
              {completedSubtasks}/{totalSubtasks} <span className="text-[#8ab4f8]">({subtasksPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                subtasksPercent === 100 
                  ? 'bg-[#34A853]' 
                  : 'bg-[#4285F4]'
              }`}
              style={{ width: `${subtasksPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Tag pills */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 ml-6">
          {task.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
