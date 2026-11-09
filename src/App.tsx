import React, { useState, useEffect } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NewTaskModal } from './components/NewTaskModal';
import { DocumentManagerModal } from './components/DocumentManagerModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AboutModal } from './components/AboutModal';
import { SettingsModal } from './components/SettingsModal';
import { TeamModal } from './components/TeamModal';
import { StartHomeScreen } from './components/StartHomeScreen';
import { UpdateNotification } from './components/UpdateNotification';
import { Task, TaskStatus } from './types/task';
import { 
  CloudCheck, 
  RotateCw, 
  HardDrive, 
  CheckCircle2, 
  Plus,
  Sparkles,
  Home
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    tasks, 
    activeBoard, 
    syncStatus, 
    saveCurrentDocument,
    user 
  } = useTaskContext();

  const { preferences, effectiveTheme, accentColorHex, isLiquidGlass } = useSettings();
  const isLight = effectiveTheme === 'light';

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // View state: Start Home Screen (Word-style template & recent picker) vs Workspace Kanban
  const [showHomeScreen, setShowHomeScreen] = useState(true);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<TaskStatus>('todo');
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<'create' | 'join' | 'manage'>('create');
  const [teamModalTargetCode, setTeamModalTargetCode] = useState<string | undefined>(undefined);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setNewTaskInitialStatus('todo');
        setIsNewTaskModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsDocManagerOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowHomeScreen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentDocument();
      } else if (e.key === 'Escape') {
        setSelectedTask(null);
        setIsNewTaskModalOpen(false);
        setIsDocManagerOpen(false);
        setIsAuthModalOpen(false);
        setIsAboutModalOpen(false);
        setIsSettingsModalOpen(false);
        setLightboxImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentDocument]);

  const handleOpenNewTaskForStatus = (status: TaskStatus) => {
    setNewTaskInitialStatus(status);
    setIsNewTaskModalOpen(true);
  };

  const handleOpenTeamModal = (mode: 'create' | 'join' | 'manage' = 'create', code?: string) => {
    setTeamModalMode(mode);
    setTeamModalTargetCode(code);
    setIsTeamModalOpen(true);
  };

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;

  // Background style based on preferences & effectiveTheme
  const bgClass = isLiquidGlass
    ? 'bg-[#050814] text-[#f5f5f7]'
    : isLight 
    ? 'bg-[#f8f9fa] text-slate-800' 
    : preferences.surfaceTheme === 'eclipse-dark'
    ? 'bg-[#0c0e15] text-[#e3e3e3]'
    : 'bg-[#131314] text-[#e3e3e3]';

  if (showHomeScreen) {
    return (
      <div className={`h-screen w-screen overflow-hidden ${bgClass}`}>
        <StartHomeScreen
          onOpenWorkspace={() => setShowHomeScreen(false)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        {isSettingsModalOpen && (
          <SettingsModal
            onClose={() => setIsSettingsModalOpen(false)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
        {isAuthModalOpen && (
          <GoogleAuthModal
            onClose={() => setIsAuthModalOpen(false)}
          />
        )}
        <UpdateNotification />
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen ${bgClass} overflow-hidden font-sans select-none relative transition-colors`}>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-20 animate-in fade-in"
        />
      )}

      {/* 1. Left Sidebar: Google Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNewDocModal={() => setIsDocManagerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenTeamModal={handleOpenTeamModal}
        onOpenHomeScreen={() => setShowHomeScreen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        {/* 2. Top Header: Google App Bar with Search Pill and Services */}
        <TopHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onOpenNewTaskModal={() => {
            setNewTaskInitialStatus('todo');
            setIsNewTaskModalOpen(true);
          }}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenAboutModal={() => setIsAboutModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenTeamModal={() => handleOpenTeamModal('manage')}
          onOpenHomeScreen={() => setShowHomeScreen(true)}
        />

        {/* 3. Main 3-Column Kanban Board (À faire, En cours, Fait) */}
        <KanbanBoard
          onOpenTaskDetails={(task) => setSelectedTask(task)}
          onOpenNewTaskModalForStatus={handleOpenNewTaskForStatus}
        />

        {/* 4. Minimal Bottom Status Bar — Apple Translucent Bar */}
        <footer className={`h-8 border-t px-4 flex items-center justify-between text-[11px] select-none shrink-0 transition-colors backdrop-blur-xl ${
          isLiquidGlass
            ? 'bg-[#090e1d]/70 border-white/15 text-slate-300'
            : isLight 
            ? 'bg-white/80 border-black/10 text-slate-600' 
            : 'bg-[#1c1c1e]/80 border-white/10 text-slate-300'
        }`}>
          <div className="flex items-center space-x-3 truncate">
            <span className={`flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <span 
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: activeBoard?.color || '#007AFF' }}
              />
              <span className="font-semibold truncate">{activeBoard?.title || 'Espace actif'}</span>
            </span>
            <span className="opacity-30">|</span>
            <span className="font-mono">{tasks.length} tâche{tasks.length > 1 ? 's' : ''} (∞)</span>
            <span className="opacity-30 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-[#FF9500] font-medium">{todoCount} à faire</span>
            <span className="hidden sm:inline text-[#007AFF] font-medium">{inProgressCount} en cours</span>
            <span className="hidden sm:inline text-[#34C759] font-medium">{doneCount} terminée{doneCount > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowHomeScreen(true)}
              className="hover:text-[#007AFF] transition-colors cursor-pointer hidden sm:inline-flex items-center space-x-1 font-medium"
              title="Ouvrir la page d'accueil & modèles (Ctrl+H)"
            >
              <Home className="w-3 h-3 text-[#007AFF]" />
              <span>Accueil & Modèles</span>
            </button>
            <span className="opacity-30 hidden sm:inline">|</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-[#007AFF] transition-colors cursor-pointer flex items-center space-x-1 font-medium"
              title="Paramètres de l'application"
            >
              <RotateCw className="w-3 h-3 text-[#007AFF]" />
              <span>Paramètres</span>
            </button>
            <span className="opacity-30">|</span>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="hover:text-[#007AFF] transition-colors cursor-pointer font-medium"
            >
              Raccourcis
            </button>
          </div>
        </footer>

        {/* Apple Capsule Action Button */}
        <button
          onClick={() => {
            setNewTaskInitialStatus('todo');
            setIsNewTaskModalOpen(true);
          }}
          className="absolute right-6 bottom-11 z-20 flex items-center space-x-2 px-5 py-3 rounded-full font-semibold text-white bg-[#007AFF] hover:bg-[#0062cc] shadow-2xl shadow-[#007AFF]/40 apple-btn-active transition-all cursor-pointer"
          title="Créer une nouvelle tâche (Ctrl+T)"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs tracking-tight">Nouvelle Tâche</span>
        </button>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onOpenLightbox={(img) => setLightboxImage(img)}
        />
      )}

      {isNewTaskModalOpen && (
        <NewTaskModal
          initialStatus={newTaskInitialStatus}
          onClose={() => setIsNewTaskModalOpen(false)}
        />
      )}

      {isDocManagerOpen && (
        <DocumentManagerModal
          onClose={() => setIsDocManagerOpen(false)}
        />
      )}

      {isTeamModalOpen && (
        <TeamModal
          initialMode={teamModalMode}
          targetSessionCode={teamModalTargetCode}
          onClose={() => setIsTeamModalOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <GoogleAuthModal
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {isAboutModalOpen && (
        <AboutModal
          onClose={() => setIsAboutModalOpen(false)}
        />
      )}

      {/* GitHub Auto-Update Notification Banner (Electron Desktop) */}
      <UpdateNotification />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <TaskProvider>
        <MainAppContent />
      </TaskProvider>
    </SettingsProvider>
  );
}
