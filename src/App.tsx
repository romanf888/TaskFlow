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
import { UpdateNotification } from './components/UpdateNotification';
import { Task, TaskStatus } from './types/task';
import { 
  CloudCheck, 
  RotateCw, 
  HardDrive, 
  CheckCircle2, 
  Plus,
  Sparkles
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    tasks, 
    activeBoard, 
    syncStatus, 
    saveCurrentDocument,
    user 
  } = useTaskContext();

  const { preferences, accentColorHex } = useSettings();

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<TaskStatus>('todo');
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;

  // Background style based on preferences
  const bgClass = preferences.surfaceTheme === 'eclipse-dark' 
    ? 'bg-[#0c0e15]' 
    : preferences.surfaceTheme === 'material-light' 
    ? 'bg-[#f8f9fa] text-slate-800' 
    : 'bg-[#131314] text-[#e3e3e3]';

  return (
    <div className={`flex h-screen w-screen ${bgClass} overflow-hidden font-sans select-none relative`}>
      {/* 1. Left Sidebar: Google Navigation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNewDocModal={() => setIsDocManagerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
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
        />

        {/* 3. Main 3-Column Kanban Board (À faire, En cours, Fait) */}
        <KanbanBoard
          onOpenTaskDetails={(task) => setSelectedTask(task)}
          onOpenNewTaskModalForStatus={handleOpenNewTaskForStatus}
        />

        {/* 4. Minimal Google Workspace Bottom Status Bar */}
        <footer className="h-7 bg-[#1e1f20] border-t border-white/10 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <span className="flex items-center space-x-1.5 text-slate-200">
              <span 
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: activeBoard?.color || '#4285F4' }}
              />
              <span className="font-semibold truncate">{activeBoard?.title || 'Espace actif'}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>{tasks.length} tâche{tasks.length > 1 ? 's' : ''}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-[#FBBC04]">{todoCount} à faire</span>
            <span className="hidden sm:inline text-[#4285F4]">{inProgressCount} en cours</span>
            <span className="hidden sm:inline text-[#34A853]">{doneCount} terminée{doneCount > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5">
              {user ? (
                <span className="flex items-center space-x-1 text-[#34A853] font-medium">
                  <CloudCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Google Cloud Sync</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-slate-400">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Stockage local actif</span>
                </span>
              )}
            </div>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-[#8ab4f8] transition-colors cursor-pointer flex items-center space-x-1"
              title="Paramètres de l'application"
            >
              <RotateCw className="w-3 h-3 text-[#4285F4]" />
              <span>Paramètres</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="hover:text-[#8ab4f8] transition-colors cursor-pointer"
            >
              Raccourcis
            </button>
          </div>
        </footer>

        {/* Google Floating Action Button (FAB) in bottom right corner */}
        <button
          onClick={() => {
            setNewTaskInitialStatus('todo');
            setIsNewTaskModalOpen(true);
          }}
          className="absolute right-6 bottom-10 z-20 flex items-center space-x-2 px-5 py-3 rounded-full font-semibold text-white bg-[#4285F4] hover:bg-[#3367d6] shadow-xl shadow-[#4285F4]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Créer une nouvelle tâche (Ctrl+T)"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-xs font-sans tracking-wide">Créer une tâche</span>
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
