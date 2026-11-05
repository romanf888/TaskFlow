import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Image as ImageIcon, 
  Tag, 
  GripVertical,
  CheckSquare
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
  const { moveTaskStatus, categories } = useTaskContext();
  const { preferences, effectiveTheme, getRoundedClass } = useSettings();
  const isLight = effectiveTheme === 'light';

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  // Find category badge
  const categoryDef = categories.find((c) => c.name === task.category);
  const categoryBadgeClass = categoryDef 
    ? categoryDef.badgeClass 
    : isLight
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-[#4285F4]/20 text-[#8ab4f8] border-[#4285F4]/30';

  // Google Priority Dot & Label
  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return {
          dot: '#EA4335', // Google Red
          label: 'Urgente',
          pillClass: isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#EA4335]/20 text-[#f28b82] border-[#EA4335]/40',
        };
      case 'high':
        return {
          dot: '#FBBC04', // Google Yellow
          label: 'Haute',
          pillClass: isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#FBBC04]/20 text-[#fdd663] border-[#FBBC04]/40',
        };
      case 'medium':
        return {
          dot: '#4285F4', // Google Blue
          label: 'Moyenne',
          pillClass: isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-[#4285F4]/20 text-[#8ab4f8] border-[#4285F4]/40',
        };
      case 'low':
        return {
          dot: '#34A853', // Google Green
          label: 'Basse',
          pillClass: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#34A853]/20 text-[#81c995] border-[#34A853]/40',
        };
      default:
        return {
          dot: '#9aa0a6',
          label: 'Normale',
          pillClass: isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-white/10 text-slate-300 border-white/20',
        };
    }
  };

  const priority = getPriorityInfo(task.priority);

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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpenDetails(task)}
      title="Cliquez pour afficher et modifier les détails complets de la tâche"
      className={`group relative border ${cardRounded} px-3 py-2.5 transition-all duration-150 cursor-pointer select-none active:scale-[0.99] ${
        isLight
          ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#4285F4]/50 shadow-xs hover:shadow-md text-slate-800'
          : 'bg-[#282a2d] hover:bg-[#323639] border-white/10 hover:border-white/25 shadow-sm hover:shadow-lg text-slate-100'
      } ${task.status === 'done' ? 'opacity-65' : ''}`}
    >
      {/* Compact Main Row */}
      <div className="flex items-center space-x-2.5">
        {/* Google Checkbox */}
        <button
          onClick={handleQuickToggleDone}
          className={`shrink-0 transition-colors cursor-pointer ${
            task.status === 'done'
              ? 'text-[#34A853]'
              : isLight
              ? 'text-slate-400 hover:text-[#34A853]'
              : 'text-slate-400 hover:text-[#34A853]'
          }`}
          title={task.status === 'done' ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
        >
          {task.status === 'done' ? (
            <CheckCircle className="w-4 h-4 text-[#34A853] fill-[#34A853]/20" />
          ) : (
            <Circle className="w-4 h-4 hover:border-[#34A853]" />
          )}
        </button>

        {/* Priority Dot */}
        <span 
          className="w-2 h-2 rounded-full shrink-0 shadow-xs" 
          style={{ backgroundColor: priority.dot }} 
          title={`Priorité : ${priority.label}`}
        />

        {/* Title */}
        <h4 className={`text-xs font-medium leading-snug truncate flex-1 ${
          task.status === 'done' 
            ? isLight ? 'line-through text-slate-400' : 'line-through text-slate-500' 
            : isLight ? 'text-slate-900 group-hover:text-[#1a73e8]' : 'text-slate-100 group-hover:text-white'
        }`}>
          {task.title}
        </h4>

        {/* Drag Grip Handle */}
        <GripVertical className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
          isLight ? 'text-slate-400' : 'text-slate-500'
        }`} />
      </div>

      {/* Discreet Secondary Badges Row (Only if category, subtasks, or attachments exist) */}
      {(task.category || totalSubtasks > 0 || task.screenshotUrl || (task.tags && task.tags.length > 0)) && (
        <div className="flex items-center space-x-1.5 mt-1.5 pl-6 flex-wrap gap-y-1">
          {/* Category Chip */}
          {task.category && (
            <span className={`px-2 py-0.2 rounded-full text-[9.5px] font-medium border ${categoryBadgeClass}`}>
              {task.category}
            </span>
          )}

          {/* Subtasks Count Badge */}
          {totalSubtasks > 0 && (
            <span 
              className={`px-1.5 py-0.2 rounded-md text-[9.5px] flex items-center space-x-1 font-mono ${
                completedSubtasks === totalSubtasks
                  ? isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-black/30 text-slate-400 border border-white/5'
              }`}
              title={`${completedSubtasks} sur ${totalSubtasks} sous-tâches terminées`}
            >
              <CheckSquare className="w-2.5 h-2.5" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </span>
          )}

          {/* Screenshot attachment badge */}
          {task.screenshotUrl && (
            <span 
              className={`p-0.5 rounded text-[10px] ${
                isLight ? 'text-blue-600' : 'text-[#8ab4f8]'
              }`}
              title="Illustration jointe (cliquer pour voir en grand)"
            >
              <ImageIcon className="w-3 h-3" />
            </span>
          )}

          {/* Tags indicator */}
          {task.tags && task.tags.length > 0 && (
            <span 
              className={`text-[9px] px-1.5 py-0.2 rounded-full border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              #{task.tags[0]}{task.tags.length > 1 ? ` +${task.tags.length - 1}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
