import React, { useState, useRef } from 'react';
import { 
  X, 
  FolderPlus, 
  Download, 
  Upload, 
  Briefcase, 
  Home, 
  Folder, 
  Code, 
  Rocket, 
  Star, 
  Check, 
  Trash2, 
  Edit2, 
  FileText,
  Calendar,
  Layers,
  HardDrive,
  Cloud
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

interface DocumentManagerModalProps {
  onClose: () => void;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({ onClose }) => {
  const {
    boards,
    activeBoardId,
    setActiveBoardId,
    createBoard,
    updateBoard,
    deleteBoard,
    exportBoardToFile,
    importBoardFromFile,
    tasks,
    user,
    projects,
  } = useTaskContext();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newIcon, setNewIcon] = useState('folder');
  const [newColor, setNewColor] = useState('#0078d4');

  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createBoard(newTitle.trim(), newDescription.trim(), newIcon, newColor, newProject || undefined);
    setIsCreating(false);
    setNewTitle('');
    setNewDescription('');
    setNewProject('');
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importBoardFromFile(file);
      e.target.value = '';
      onClose();
    }
  };

  const renderIcon = (iconName?: string, color?: string) => {
    const style = { color: color || '#3b82f6' };
    switch (iconName) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5" style={style} />;
      case 'home':
        return <Home className="w-5 h-5" style={style} />;
      case 'code':
        return <Code className="w-5 h-5" style={style} />;
      case 'rocket':
        return <Rocket className="w-5 h-5" style={style} />;
      case 'star':
        return <Star className="w-5 h-5" style={style} />;
      default:
        return <Folder className="w-5 h-5" style={style} />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".taskflow,.json"
        className="hidden"
      />

      <div 
        className="w-full max-w-2xl bg-[#1e1f20] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#191a1b] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#4285F4]/20 text-[#8ab4f8] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Gestionnaire d'Espaces & Projets (.taskflow)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Top Actions: Create Document & Import File */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <p className="text-slate-400 text-xs">
              Organisez vos tâches par projets professionnels, personnels ou clients distincts.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-md transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Importer un fichier (.taskflow)</span>
              </button>

              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Nouveau document</span>
              </button>
            </div>
          </div>

          {/* New Document Creator Form */}
          {isCreating && (
            <form onSubmit={handleCreate} className="p-4 bg-[#1e2334] rounded-lg border border-blue-500/30 space-y-3 animate-in fade-in">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <span>Créer un nouveau document de tâches</span>
              </h4>

              <div>
                <label className="block text-slate-400 mb-1">Nom du projet / document *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Refonte Site E-commerce, Vacances d'Hiver, Lancement..."
                  className="w-full bg-[#242b3e] border border-white/15 rounded-md px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description (optionnelle)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Tâches liées au sprint technique et aux livrables..."
                  className="w-full bg-[#242b3e] border border-white/15 rounded-md px-3 py-1.5 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catégorie dans le document (Optionnel)</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-[#242b3e] border border-white/15 rounded-md px-3 py-1.5 text-slate-100 text-xs focus:outline-none"
                >
                  <option value="">-- Aucune catégorie (Racine du document) --</option>
                  {projects.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Icon & Color selector */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1">Icône</label>
                  <div className="flex items-center space-x-1.5">
                    {[
                      { id: 'folder', icon: <Folder className="w-4 h-4" /> },
                      { id: 'briefcase', icon: <Briefcase className="w-4 h-4" /> },
                      { id: 'home', icon: <Home className="w-4 h-4" /> },
                      { id: 'code', icon: <Code className="w-4 h-4" /> },
                      { id: 'rocket', icon: <Rocket className="w-4 h-4" /> },
                      { id: 'star', icon: <Star className="w-4 h-4" /> },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setNewIcon(item.id)}
                        className={`p-2 rounded-md transition-colors ${
                          newIcon === item.id ? 'bg-blue-600 text-white' : 'bg-[#242b3e] text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Couleur</label>
                  <div className="flex items-center space-x-2">
                    {['#0078d4', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'].map((col) => (
                      <button
                        type="button"
                        key={col}
                        onClick={() => setNewColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          newColor === col ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-300 rounded text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs"
                >
                  Créer le document
                </button>
              </div>
            </form>
          )}

          {/* Documents List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Documents existants ({boards.length})
            </h4>

            {boards.map((b) => {
              const isActive = b.id === activeBoardId;
              const isEditingThis = editingBoardId === b.id;

              return (
                <div
                  key={b.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-[#1e2436] border-blue-500/60 ring-1 ring-blue-500/20'
                      : 'bg-[#181c2b] border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-start space-x-3 truncate mb-2 sm:mb-0">
                    <div className="p-2.5 rounded-lg bg-black/30 shrink-0">
                      {renderIcon(b.icon, b.color)}
                    </div>

                    <div className="truncate">
                      {isEditingThis ? (
                        <div className="flex items-center space-x-2 mb-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-[#242b3e] border border-white/20 rounded px-2 py-0.5 text-xs text-white"
                          />
                          <button
                            onClick={async () => {
                              if (editTitle.trim()) {
                                await updateBoard(b.id, { title: editTitle.trim() });
                              }
                              setEditingBoardId(null);
                            }}
                            className="p-1 bg-emerald-600 text-white rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h5 className="font-semibold text-slate-100 text-sm truncate">
                            {b.title}
                          </h5>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Document Actif
                            </span>
                          )}
                          {user && (
                            <span className="p-0.5 text-emerald-400" title="Synchronisé dans le Cloud">
                              <Cloud className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      )}

                      {b.description && (
                        <p className="text-slate-400 text-xs truncate max-w-sm">
                          {b.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                        <span>Format: .taskflow</span>
                        <span>•</span>
                        <span>Créé le {new Date(b.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-center">
                    {!isActive && (
                      <button
                        onClick={() => {
                          setActiveBoardId(b.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                      >
                        Ouvrir
                      </button>
                    )}

                    <button
                      onClick={() => exportBoardToFile(b.id)}
                      className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-sky-300 transition-colors"
                      title="Télécharger le fichier .taskflow sur votre ordinateur"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingBoardId(b.id);
                        setEditTitle(b.title);
                      }}
                      className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Renommer le document"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {boards.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer définitivement le document "${b.title}" et toutes ses tâches ?`)) {
                            deleteBoard(b.id);
                          }
                        }}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Supprimer ce document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#1e2334] border-t border-white/10 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">
            {user ? '☁️ Sauvegarde automatique sur votre compte Google' : '💾 Sauvegarde locale active (Connectez Google pour la synchronisation multi-appareils)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded text-xs font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
