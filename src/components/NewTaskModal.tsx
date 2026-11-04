import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Image as ImageIcon, 
  CheckSquare, 
  Trash2, 
  Layers, 
  Tag, 
  AlertCircle,
  Sparkles,
  Upload
} from 'lucide-react';
import { TaskStatus, TaskPriority, Subtask } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { createSampleIllustration } from '../utils/sampleIllustrations';

interface NewTaskModalProps {
  initialStatus: TaskStatus;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  initialStatus,
  onClose,
}) => {
  const { createTask, categories } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Professionnel');
  const [tags, setTags] = useState<string[]>(['Important']);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: subtaskInput.trim(),
        completed: false,
      },
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string;
        if (base64) setScreenshotUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVisual = () => {
    const generated = createSampleIllustration(
      title || 'Nouvelle tâche',
      category || 'Illustration',
      priority === 'urgent' ? '#ef4444' : '#0078d4'
    );
    setScreenshotUrl(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      tags,
      subtasks,
      screenshotUrl,
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#1e1f20] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#191a1b] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#4285F4]/20 text-[#8ab4f8] flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Nouvelle Tâche Workspace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Titre de la tâche <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Rédiger le rapport d'activité mensuel..."
              className="w-full bg-[#1e2334] border border-white/15 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Colonne</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#1e2334] border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
              >
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Fait</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Priorité</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#1e2334] border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="space-y-2">
            <div>
              <label className="block text-slate-400 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1e2334] border border-white/15 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Tags personnalisés</label>
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white/10 text-slate-200 text-xs font-mono"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="+ Ajouter un tag (ex: Urgent, Client)..."
                  className="flex-1 bg-[#1e2334] border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded text-xs"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Détails de ce qu'il faut faire
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Expliquez la marche à suivre, les liens utiles, les critères de validation..."
              className="w-full bg-[#1e2334] border border-white/15 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Screenshot / Illustration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Illustration / Capture d'écran</span>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Importer image</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateVisual}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Générer aperçu</span>
                </button>
              </div>
            </div>

            {screenshotUrl && (
              <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-36 bg-black/40">
                <img src={screenshotUrl} alt="Preview" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => setScreenshotUrl(undefined)}
                  className="absolute top-2 right-2 p-1 rounded bg-black/70 text-red-400 hover:text-red-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sous-tâches (Checklist)</span>
            </label>
            {subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-1.5 bg-[#1b202e] rounded border border-white/5">
                <span className="text-xs text-slate-300">{sub.title}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(sub.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="+ Ajouter une sous-tâche..."
                className="flex-1 bg-[#1e2334] border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded text-xs"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-full text-xs font-medium cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold rounded-full text-xs shadow-md shadow-[#4285F4]/30 cursor-pointer transition-all active:scale-95"
            >
              Créer la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
