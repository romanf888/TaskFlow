import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Pencil, 
  Check, 
  Trash2, 
  Copy, 
  Image as ImageIcon, 
  Plus, 
  CheckSquare, 
  Square, 
  Maximize2, 
  Tag, 
  Layers, 
  AlertCircle,
  Upload,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, STATUS_COLUMNS, Subtask } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { createSampleIllustration } from '../utils/sampleIllustrations';
import { compressImageDataUrl } from '../utils/imageCompressor';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onOpenLightbox: (imageUrl: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onOpenLightbox,
}) => {
  const { 
    updateTask, 
    deleteTask, 
    duplicateTask, 
    toggleSubtask, 
    categories 
  } = useTaskContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState<TaskStatus>('todo');
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editedSubtasks, setEditedSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editedScreenshotUrl, setEditedScreenshotUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title || '');
      setEditedDescription(task.description || '');
      setEditedStatus(task.status || 'todo');
      setEditedPriority(task.priority || 'medium');
      setEditedCategory(task.category || '');
      setEditedTags(task.tags || []);
      setEditedSubtasks(task.subtasks || []);
      setEditedScreenshotUrl(task.screenshotUrl);
      setIsEditing(false);
    }
  }, [task]);

  // Handle paste screenshot from clipboard anywhere in modal!
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = async (loadEvent) => {
              const base64 = loadEvent.target?.result as string;
              if (base64) {
                const compressed = await compressImageDataUrl(base64);
                setEditedScreenshotUrl(compressed);
                if (task && !isEditing) {
                  updateTask(task.id, { screenshotUrl: compressed });
                }
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [task, isEditing, updateTask]);

  if (!task) return null;

  const handleSave = async () => {
    if (!editedTitle.trim()) return;

    await updateTask(task.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim(),
      status: editedStatus,
      priority: editedPriority,
      category: editedCategory,
      tags: editedTags,
      subtasks: editedSubtasks,
      screenshotUrl: editedScreenshotUrl,
    });

    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = [...editedSubtasks, newSub];
    setEditedSubtasks(updated);
    setNewSubtaskTitle('');

    // If in view mode, directly update task
    if (!isEditing) {
      updateTask(task.id, { subtasks: updated });
    }
  };

  const handleRemoveSubtask = (subId: string) => {
    const updated = editedSubtasks.filter((s) => s.id !== subId);
    setEditedSubtasks(updated);
    if (!isEditing) {
      updateTask(task.id, { subtasks: updated });
    }
  };

  const handleToggleSubtaskInModal = async (subId: string) => {
    const updated = editedSubtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    setEditedSubtasks(updated);
    await toggleSubtask(task.id, subId);
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !editedTags.includes(trimmed)) {
      const updated = [...editedTags, trimmed];
      setEditedTags(updated);
      setNewTagInput('');
      if (!isEditing) {
        updateTask(task.id, { tags: updated });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = editedTags.filter((t) => t !== tagToRemove);
    setEditedTags(updated);
    if (!isEditing) {
      updateTask(task.id, { tags: updated });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        if (base64) {
          const compressed = await compressImageDataUrl(base64);
          setEditedScreenshotUrl(compressed);
          if (!isEditing) {
            updateTask(task.id, { screenshotUrl: compressed });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateIllustration = () => {
    const generated = createSampleIllustration(
      task.title,
      task.category || 'Illustration Tâche',
      task.priority === 'urgent' ? '#ef4444' : '#0078d4'
    );
    setEditedScreenshotUrl(generated);
    if (!isEditing) {
      updateTask(task.id, { screenshotUrl: generated });
    }
  };

  const completedSubCount = editedSubtasks.filter((s) => s.completed).length;
  const subPercent = editedSubtasks.length > 0 ? Math.round((completedSubCount / editedSubtasks.length) * 100) : 0;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#1e1f20] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Screenshot Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Apple Style Header */}
        <div className="px-6 py-4 bg-[#1c1c1e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 truncate pr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]"></span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isEditing ? 'Édition de la tâche' : 'Détails de la tâche'}
            </span>
          </div>

          {/* Action buttons: Pencil Edit Icon & Close button */}
          <div className="flex items-center space-x-2">
            {/* The Famous Top-Right Pencil Icon (Crayon en haut à droite) */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isEditing
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-white/10 hover:bg-blue-600 hover:text-white text-slate-300'
              }`}
              title={isEditing ? 'Enregistrer les modifications' : 'Éditer rapidement la tâche (Crayon)'}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                  <span>Modifier</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fermer (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-xs">Colonne :</span>
              {isEditing ? (
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value as TaskStatus)}
                  className="bg-[#242b3e] border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Fait</option>
                </select>
              ) : (
                <div className="flex items-center space-x-1">
                  {STATUS_COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        setEditedStatus(col.id);
                        updateTask(task.id, { status: col.id });
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        task.status === col.id
                          ? `${col.badgeClass} ring-1 ring-white/20 shadow-sm`
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-xs">Priorité :</span>
              {isEditing ? (
                <select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value as TaskPriority)}
                  className="bg-[#242b3e] border border-white/15 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              ) : (
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  task.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  task.priority === 'low' ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Haute' : task.priority === 'low' ? 'Basse' : 'Moyenne'}
                </span>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div>
            {isEditing ? (
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Titre de la tâche</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Ex: Refonte du tableau de bord..."
                  className="w-full bg-[#1e2334] border border-white/15 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : (
              <h2 className={`text-lg font-bold tracking-tight text-white ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h2>
            )}
          </div>

          {/* Category & Tags Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Catégorie :</span>
              </span>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="bg-[#242b3e] border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs"
                  >
                    <option value="">Aucune catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    placeholder="Ou personnalisée..."
                    className="bg-[#242b3e] border border-white/15 rounded px-2 py-1 text-slate-200 text-xs"
                  />
                </div>
              ) : (
                task.category ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30">
                    {task.category}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Non catégorisé</span>
                )
              )}
            </div>

            {/* Custom Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-slate-400 flex items-center space-x-1 mr-1">
                <Tag className="w-3.5 h-3.5 text-pink-400" />
                <span>Tags :</span>
              </span>
              {editedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white/10 text-slate-200 text-xs font-mono"
                >
                  <span>#{tag}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              {isEditing && (
                <div className="inline-flex items-center space-x-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ Tag..."
                    className="w-20 bg-[#242b3e] border border-white/15 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Details / Description Section ("pour voir les détails de ce qu'il faut faire") */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <span>Détails & Instructions de la tâche</span>
            </label>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
                placeholder="Expliquez en détail ce qu'il faut faire pour accomplir cette tâche..."
                className="w-full bg-[#1e2334] border border-white/15 focus:border-blue-500 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
              />
            ) : (
              <div className="bg-[#1b202e] border border-white/10 rounded-lg p-3.5 text-slate-300 leading-relaxed whitespace-pre-line text-xs font-normal">
                {task.description ? task.description : (
                  <span className="text-slate-500 italic">Aucune description détaillée renseignée. Cliquez sur le crayon en haut à droite pour en ajouter une.</span>
                )}
              </div>
            )}
          </div>

          {/* Screenshot / Illustration Section ("et également une capture d'écran pour montrer avec une illustration") */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>Capture d'écran & Illustration visuelle</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Téléverser une capture d'écran depuis votre disque"
                >
                  <Upload className="w-3 h-3 text-sky-400" />
                  <span>Importer image</span>
                </button>
                <button
                  onClick={handleGenerateIllustration}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Générer une illustration schématique"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Générer visuel</span>
                </button>
              </div>
            </div>

            {editedScreenshotUrl ? (
              <div className="relative group rounded-lg overflow-hidden border border-white/15 bg-black/40">
                <img
                  src={editedScreenshotUrl}
                  alt="Capture d'écran / illustration de la tâche"
                  className="w-full max-h-64 object-contain bg-[#11141d] cursor-zoom-in hover:brightness-105 transition-all"
                  onClick={() => onOpenLightbox(editedScreenshotUrl)}
                />
                
                {/* Floating Overlay Buttons */}
                <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onOpenLightbox(editedScreenshotUrl)}
                    className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                    title="Agrandir en plein écran"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedScreenshotUrl(undefined);
                      if (!isEditing) {
                        updateTask(task.id, { screenshotUrl: undefined });
                      }
                    }}
                    className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/20"
                    title="Supprimer la capture d'écran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                  Conseil : Vous pouvez coller directement une capture d'écran avec Ctrl+V
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
              >
                <ImageIcon className="w-7 h-7 text-slate-500 mb-2" />
                <p className="text-xs font-medium text-slate-300">
                  Aucune capture d'écran attachée
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cliquez pour importer une image ou collez directement (<kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]">Ctrl+V</kbd>) depuis votre presse-papier
                </p>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Sous-tâches</span>
                {editedSubtasks.length > 0 && (
                  <span className="text-slate-400 font-normal">
                    ({completedSubCount}/{editedSubtasks.length} terminées - {subPercent}%)
                  </span>
                )}
              </label>
            </div>

            {/* Subtask list */}
            <div className="space-y-1.5">
              {editedSubtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-md bg-[#1b202e] hover:bg-[#202637] border border-white/5 transition-colors group"
                >
                  <button
                    onClick={() => handleToggleSubtaskInModal(sub.id)}
                    className="flex items-center space-x-2.5 text-left flex-1 cursor-pointer"
                  >
                    {sub.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0" />
                    )}
                    <span className={`text-xs ${sub.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {sub.title}
                    </span>
                  </button>

                  <button
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer la sous-tâche"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Ajouter une sous-tâche..."
                className="flex-1 bg-[#1e2334] border border-white/10 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#1e2334] border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                await duplicateTask(task.id);
                onClose();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
              title="Créer une copie de cette tâche"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Dupliquer</span>
            </button>

            <button
              onClick={async () => {
                if (window.confirm('Supprimer définitivement cette tâche ?')) {
                  await deleteTask(task.id);
                  onClose();
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded text-xs transition-colors cursor-pointer"
              title="Supprimer la tâche"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Enregistrer
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
