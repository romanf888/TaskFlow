import React, { useState, useRef } from 'react';
import { 
  FileText, 
  FolderOpen, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Sparkles, 
  ChevronDown, 
  Briefcase, 
  Home, 
  Folder, 
  Check, 
  Layers, 
  Trash2,
  Info,
  SlidersHorizontal,
  Cloud
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

interface WindowsMenuBarProps {
  onOpenNewTaskModal: () => void;
  onOpenDocManager: () => void;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
}

export const WindowsMenuBar: React.FC<WindowsMenuBarProps> = ({
  onOpenNewTaskModal,
  onOpenDocManager,
  onOpenAuthModal,
  onOpenAboutModal,
}) => {
  const {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    exportBoardToFile,
    importBoardFromFile,
    saveCurrentDocument,
  } = useTaskContext();

  const [activeMenu, setActiveMenu] = useState<'fichier' | 'edition' | 'affichage' | 'aide' | null>(null);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importBoardFromFile(file);
      e.target.value = '';
    }
  };

  const getBoardIcon = (iconName?: string) => {
    switch (iconName) {
      case 'briefcase':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case 'home':
        return <Home className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Folder className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="bg-[#181c28] border-b border-white/10 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 relative z-20 text-xs">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".taskflow,.json"
        className="hidden"
      />

      {/* Left: Classic Menu strip & Document Quick Switcher */}
      <div className="flex items-center space-x-2">
        {/* Windows Dropdown Menus */}
        <div className="flex items-center space-x-1 text-slate-300">
          {/* Fichier Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'fichier' ? null : 'fichier')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors font-normal cursor-pointer ${
                activeMenu === 'fichier' ? 'bg-white/15 text-white' : ''
              }`}
            >
              Fichier
            </button>
            {activeMenu === 'fichier' && (
              <div 
                className="absolute left-0 top-7 w-60 bg-[#1e2333] border border-white/15 rounded-md shadow-2xl py-1 z-50 animate-in fade-in text-slate-200"
                onClick={() => setActiveMenu(null)}
              >
                <button
                  onClick={onOpenDocManager}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span className="flex-1">Nouveau document...</span>
                  <span className="text-[10px] text-slate-500">Ctrl+N</span>
                </button>
                <button
                  onClick={onOpenDocManager}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="flex-1">Gestionnaire de projets...</span>
                  <span className="text-[10px] text-slate-500">Ctrl+O</span>
                </button>
                <button
                  onClick={saveCurrentDocument}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="flex-1">Enregistrer le document</span>
                  <span className="text-[10px] text-slate-500">Ctrl+S</span>
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button
                  onClick={() => exportBoardToFile(activeBoardId)}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Enregistrer sous (.taskflow)</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ouvrir un fichier existant...</span>
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button
                  onClick={onOpenAuthModal}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Synchronisation Cloud Google...</span>
                </button>
              </div>
            )}
          </div>

          {/* Édition Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edition' ? null : 'edition')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors font-normal cursor-pointer ${
                activeMenu === 'edition' ? 'bg-white/15 text-white' : ''
              }`}
            >
              Édition
            </button>
            {activeMenu === 'edition' && (
              <div 
                className="absolute left-0 top-7 w-56 bg-[#1e2333] border border-white/15 rounded-md shadow-2xl py-1 z-50 animate-in fade-in text-slate-200"
                onClick={() => setActiveMenu(null)}
              >
                <button
                  onClick={onOpenNewTaskModal}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span className="flex-1">Nouvelle tâche</span>
                  <span className="text-[10px] text-slate-500">Ctrl+T</span>
                </button>
                <button
                  onClick={onOpenDocManager}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Organiser les documents</span>
                </button>
              </div>
            )}
          </div>

          {/* Affichage Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'affichage' ? null : 'affichage')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors font-normal cursor-pointer ${
                activeMenu === 'affichage' ? 'bg-white/15 text-white' : ''
              }`}
            >
              Affichage
            </button>
            {activeMenu === 'affichage' && (
              <div 
                className="absolute left-0 top-7 w-56 bg-[#1e2333] border border-white/15 rounded-md shadow-2xl py-1 z-50 animate-in fade-in text-slate-200"
                onClick={() => setActiveMenu(null)}
              >
                <div className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Thème
                </div>
                <div className="flex items-center justify-between px-3 py-1 text-slate-200 bg-white/5">
                  <span>Mode Sombre Windows</span>
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="px-3 py-1.5 text-[11px] text-slate-400">
                  Vue Kanban standard : À faire, En cours, Fait
                </div>
              </div>
            )}
          </div>

          {/* Aide Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'aide' ? null : 'aide')}
              className={`px-2 py-1 rounded hover:bg-white/10 transition-colors font-normal cursor-pointer ${
                activeMenu === 'aide' ? 'bg-white/15 text-white' : ''
              }`}
            >
              Aide
            </button>
            {activeMenu === 'aide' && (
              <div 
                className="absolute left-0 top-7 w-56 bg-[#1e2333] border border-white/15 rounded-md shadow-2xl py-1 z-50 animate-in fade-in text-slate-200"
                onClick={() => setActiveMenu(null)}
              >
                <button
                  onClick={onOpenAboutModal}
                  className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white text-left transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>À propos de TaskFlow Windows</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-white/15 hidden sm:block"></div>

        {/* Document Quick Switcher (Pro vs Perso vs Other projects) */}
        <div className="relative">
          <button
            onClick={() => setShowDocPicker(!showDocPicker)}
            className="flex items-center space-x-2 bg-[#202534] hover:bg-[#282f42] border border-white/15 px-2.5 py-1 rounded-md text-slate-200 transition-all cursor-pointer shadow-sm"
            title="Changer de document de tâches"
          >
            {getBoardIcon(activeBoard?.icon)}
            <span className="font-medium max-w-[150px] truncate">
              {activeBoard?.title || 'Sélectionner document'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDocPicker && (
            <div 
              className="absolute left-0 top-8 w-64 bg-[#1b202e] border border-white/15 rounded-lg shadow-2xl p-2 z-50 animate-in fade-in"
              onClick={() => setShowDocPicker(false)}
            >
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 px-2 py-1">
                Vos Documents de Tâches
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {boards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBoardId(b.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                      b.id === activeBoardId
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {getBoardIcon(b.icon)}
                      <span className="truncate">{b.title}</span>
                    </div>
                    {b.id === activeBoardId && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between">
                <button
                  onClick={onOpenDocManager}
                  className="w-full flex items-center justify-center space-x-1.5 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Gérer ou Créer un document...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Save Current Document Button */}
        <button
          onClick={saveCurrentDocument}
          className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded transition-colors cursor-pointer"
          title="Enregistrer les modifications locales"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Enregistrer</span>
        </button>

        {/* Export .taskflow file button */}
        <button
          onClick={() => exportBoardToFile(activeBoardId)}
          className="flex items-center space-x-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded transition-colors cursor-pointer"
          title="Télécharger le fichier .taskflow sur votre ordinateur"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Exporter (.taskflow)</span>
        </button>

        {/* Primary "+ Nouvelle Tâche" Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow-md shadow-blue-600/30 transition-all hover:shadow-blue-500/40 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle tâche</span>
        </button>
      </div>
    </div>
  );
};
