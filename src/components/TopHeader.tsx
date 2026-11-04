import React from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  X, 
  Save, 
  Download, 
  Cloud, 
  CloudCheck, 
  RotateCw, 
  Layers, 
  Sparkles,
  HelpCircle,
  Briefcase,
  Home,
  Code,
  Rocket,
  Star,
  Folder,
  Settings
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenNewTaskModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
  onOpenSettingsModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenNewTaskModal,
  onOpenAuthModal,
  onOpenAboutModal,
  onOpenSettingsModal,
}) => {
  const {
    activeBoard,
    activeBoardId,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    saveCurrentDocument,
    exportBoardToFile,
    user,
    syncStatus,
    notificationMessage,
  } = useTaskContext();

  const getBoardIcon = (iconName?: string, color: string = '#3b82f6') => {
    switch (iconName) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5" style={{ color }} />;
      case 'home':
        return <Home className="w-5 h-5" style={{ color }} />;
      case 'code':
        return <Code className="w-5 h-5" style={{ color }} />;
      case 'rocket':
        return <Rocket className="w-5 h-5" style={{ color }} />;
      case 'star':
        return <Star className="w-5 h-5" style={{ color }} />;
      default:
        return <Folder className="w-5 h-5" style={{ color }} />;
    }
  };

  const activeColor = activeBoard?.color || '#3b82f6';

  return (
    <header className="bg-[#141724]/95 backdrop-blur-md border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-20 select-none shadow-md">
      {/* Left: Sidebar Toggle & Active Document Info */}
      <div className="flex items-center space-x-3 min-w-[200px]">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isSidebarOpen 
              ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title={isSidebarOpen ? "Masquer le panneau des documents" : "Afficher les documents (Pro / Perso)"}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 truncate">
          <div 
            className="p-1.5 rounded-lg shrink-0 flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${activeColor}20` }}
          >
            {getBoardIcon(activeBoard?.icon, activeColor)}
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm text-white truncate tracking-tight">
                {activeBoard?.title || 'Mon Document'}
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
                .taskflow
              </span>
            </div>
            {activeBoard?.description && (
              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                {activeBoard.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center: Search & Quick Category Filter */}
      <div className="flex items-center space-x-2 flex-1 max-w-xl mx-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une tâche, tag..."
            className="w-full bg-[#1b2030] border border-white/10 focus:border-blue-500 rounded-lg pl-8 pr-7 py-1.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="hidden md:flex items-center space-x-1 overflow-x-auto py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Toutes
          </button>
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                selectedCategory === cat.name
                  ? `${cat.badgeClass} ring-1 ring-white/20 font-bold`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Quick Actions & Primary "+ Nouvelle Tâche" */}
      <div className="flex items-center space-x-2">
        {/* Save button */}
        <button
          onClick={saveCurrentDocument}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 border border-white/10 transition-colors cursor-pointer"
          title="Sauvegarder les modifications locales (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Export .taskflow button */}
        <button
          onClick={() => exportBoardToFile(activeBoardId)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-sky-300 border border-white/10 transition-colors cursor-pointer"
          title="Télécharger le fichier .taskflow sur votre ordinateur"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Settings & Auto-Updates button */}
        {onOpenSettingsModal && (
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Paramètres & Mises à jour du logiciel"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Cloud sync button / status */}
        <button
          onClick={onOpenAuthModal}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
            user
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              : 'bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30'
          }`}
          title={user ? `Synchronisé avec ${user.email}` : "Connecter Google Cloud pour synchroniser"}
        >
          {syncStatus === 'syncing' ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
          ) : user ? (
            <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span className="hidden sm:inline">
            {user ? 'Cloud Sync' : 'Connexion Google'}
          </span>
        </button>

        {/* Primary Colorful Button: + Nouvelle Tâche */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/30 hover:shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle tâche</span>
        </button>
      </div>
    </header>
  );
};
