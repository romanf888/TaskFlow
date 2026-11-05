import React, { useState } from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  X, 
  Save, 
  Download, 
  Cloud, 
  CloudCheck, 
  Settings,
  Grip,
  Check,
  ExternalLink,
  ChevronDown,
  Minus,
  Square,
  Maximize2,
  Sun,
  Moon,
  Monitor,
  Users,
  Globe,
  BookOpen
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { TaskFlowLogo } from './TaskFlowLogo';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenNewTaskModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
  onOpenSettingsModal?: () => void;
  onOpenTeamModal?: () => void;
  onOpenLandingPage?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenNewTaskModal,
  onOpenAuthModal,
  onOpenAboutModal,
  onOpenSettingsModal,
  onOpenTeamModal,
  onOpenLandingPage,
}) => {
  const {
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    searchQuery,
    setSearchQuery,
    saveCurrentDocument,
    user,
  } = useTaskContext();

  const { preferences, effectiveTheme, setThemeMode } = useSettings();
  const isLight = effectiveTheme === 'light';

  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
  const activeColor = activeBoard?.color || '#4285F4';

  const handleMinimize = () => {
    if ((window as any).electronAPI?.minimizeWindow) {
      (window as any).electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if ((window as any).electronAPI?.maximizeWindow) {
      await (window as any).electronAPI.maximizeWindow();
      if ((window as any).electronAPI?.isMaximized) {
        const max = await (window as any).electronAPI.isMaximized();
        setIsMaximized(max);
      } else {
        setIsMaximized(!isMaximized);
      }
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI?.closeWindow) {
      (window as any).electronAPI.closeWindow();
    }
  };

  const cycleTheme = () => {
    if (preferences.themeMode === 'system') {
      setThemeMode('light');
    } else if (preferences.themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  return (
    <header 
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      className={`px-4 py-2 flex items-center justify-between gap-3 text-xs z-20 select-none shadow-xs shrink-0 border-b transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1e1f20] border-white/10 text-slate-200'
      }`}
    >
      {/* Left: Hamburger menu + TaskFlow Logo + Document badge */}
      <div 
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} 
        className="flex items-center space-x-2 shrink-0"
      >
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={isSidebarOpen ? "Réduire le panneau latéral" : "Ouvrir le panneau latéral"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Custom TaskFlow Logo */}
        <div className="cursor-pointer" onClick={() => onOpenAboutModal()}>
          <TaskFlowLogo size={30} showText={true} />
        </div>

        {/* Current Document Pill */}
        <div className="relative hidden sm:block ml-2">
          <button
            onClick={() => setShowDocPicker(!showDocPicker)}
            className={`flex items-center space-x-2 border px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs group ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                : 'bg-[#282a2d] hover:bg-[#323639] border-white/10 text-slate-200'
            }`}
          >
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" 
              style={{ backgroundColor: activeColor }} 
            />
            <span className={`font-medium max-w-[140px] truncate text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {activeBoard?.title || 'Document'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {showDocPicker && (
            <div 
              className={`absolute left-0 top-10 w-64 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#282a2d] border-white/15 text-slate-200'
              }`}
              onClick={() => setShowDocPicker(false)}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                Projets & Documents
              </div>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {boards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBoardId(b.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      b.id === activeBoardId
                        ? 'bg-[#4285F4]/20 text-[#4285F4] font-semibold border border-[#4285F4]/30'
                        : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color || '#4285F4' }} />
                      <span className="truncate">{b.title}</span>
                    </div>
                    {b.id === activeBoardId && <Check className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Pill (Draggable outside the input itself) */}
      <div className="flex-1 max-w-xl mx-2">
        <div 
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} 
          className="relative flex items-center"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des tâches, étiquettes ou projets..."
            className={`w-full border rounded-full pl-10 pr-9 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 shadow-inner transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200/70 focus:bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                : 'bg-[#282a2d] hover:bg-[#303134] focus:bg-[#303134] border-transparent focus:border-[#4285F4]/50 text-slate-100 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, Theme Switcher, User & Window Controls */}
      <div 
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} 
        className="flex items-center space-x-1 shrink-0"
      >
        {/* Quick Theme Toggle (System / Light / Dark) */}
        <button
          onClick={cycleTheme}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          title={`Thème actuel : ${
            preferences.themeMode === 'system' 
              ? 'Système (automatique)' 
              : preferences.themeMode === 'light' 
              ? 'Mode Clair' 
              : 'Mode Sombre'
          } (Cliquer pour alterner)`}
        >
          {preferences.themeMode === 'system' ? (
            <Monitor className="w-4 h-4 text-[#4285F4]" />
          ) : preferences.themeMode === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </button>

        {/* Team Collaboration button */}
        {onOpenTeamModal && (
          <button
            onClick={onOpenTeamModal}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-emerald-600' : 'hover:bg-white/10 text-emerald-400'
            }`}
            title="Session d'équipe & Collaboration par code"
          >
            <Users className="w-4 h-4" />
          </button>
        )}

        {/* Presentation Site & Wiki toggle */}
        {onOpenLandingPage && (
          <button
            onClick={onOpenLandingPage}
            className={`hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-full border transition-colors cursor-pointer text-xs font-semibold ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' 
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            }`}
            title="Ouvrir le site de présentation & Wiki"
          >
            <Globe className="w-3.5 h-3.5 text-[#4285F4]" />
            <span>Site & Wiki</span>
          </button>
        )}

        {/* Save button */}
        <button
          onClick={saveCurrentDocument}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-emerald-600' : 'hover:bg-white/10 text-slate-300 hover:text-emerald-400'
          }`}
          title="Sauvegarder le document (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Settings button */}
        {onOpenSettingsModal && (
          <button
            onClick={onOpenSettingsModal}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Paramètres de l'application"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* 9-dots App Launcher */}
        <div className="relative">
          <button
            onClick={() => setShowAppsMenu(!showAppsMenu)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Services & Liens TaskFlow"
          >
            <Grip className="w-4 h-4" />
          </button>

          {showAppsMenu && (
            <div 
              className={`absolute right-0 top-11 w-72 border rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#282a2d] border-white/15 text-slate-200'
              }`}
              onClick={() => setShowAppsMenu(false)}
            >
              <div className="flex items-center space-x-2 pb-3 border-b border-black/10 dark:border-white/10 mb-3">
                <TaskFlowLogo size={24} showText={false} />
                <span className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>Services TaskFlow</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <a
                  href="https://romanf888.github.io/TaskFlow/"
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 border rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition-colors cursor-pointer ${
                    isLight 
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
                      : 'bg-[#1e1f20] hover:bg-[#323639] border-white/10 text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium">Version Web</span>
                  <span className="text-[9px] text-slate-400">GitHub Pages</span>
                </a>

                <a
                  href="https://github.com/romanf888/TaskFlow"
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 border rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition-colors cursor-pointer ${
                    isLight 
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
                      : 'bg-[#1e1f20] hover:bg-[#323639] border-white/10 text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium">Dépôt GitHub</span>
                  <span className="text-[9px] text-slate-400">Code & Releases</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User / Google Profile */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center space-x-1.5 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title={user ? `Connecté avec ${user.email} (Cloud Synced)` : "Se connecter avec un compte Google"}
        >
          {user ? (
            <div className="relative">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Utilisateur'} 
                  className="w-7 h-7 rounded-full border-2 border-[#34A853]" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs font-bold border border-white/20">
                  {user.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34A853] border-2 border-white dark:border-[#1e1f20]" />
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/40 text-[#4285F4] text-xs font-medium hover:bg-[#4285F4]/25 transition-all">
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connexion</span>
            </div>
          )}
        </button>

        {/* Google FAB Style "+ Créer" Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-white bg-[#4285F4] hover:bg-[#3367d6] shadow-md shadow-[#4285F4]/30 active:scale-95 transition-all cursor-pointer text-xs ml-1"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline font-sans">Créer</span>
        </button>

        {/* Electron Window Actions (Frameless Native Window Controls) */}
        {isElectron && (
          <div className="flex items-center ml-2 pl-2 border-l border-black/10 dark:border-white/15 h-8">
            <button
              onClick={handleMinimize}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Réduire"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isMaximized ? "Restaurer" : "Agrandir"}
            >
              {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3 h-3" />}
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#EA4335] rounded-lg transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
