import React, { useState, useEffect } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
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
  FileText, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    tasks, 
    activeBoard, 
    syncStatus, 
    saveCurrentDocument,
    user 
  } = useTaskContext();

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
      // Check for Ctrl/Cmd keys
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

  return (
    <div className="flex h-screen w-screen bg-[#0c0e15] text-slate-100 overflow-hidden font-sans">
      {/* 1. Left Sidebar: Document Switcher menu (1-click to switch projects) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNewDocModal={() => setIsDocManagerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* 2. Top Header (Clean, fast search, category pills, save, + Nouvelle tâche) */}
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

        {/* 4. Minimal Bottom Status Bar */}
        <footer className="h-6 bg-[#10131e] border-t border-white/10 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <span className="flex items-center space-x-1 text-slate-300">
              <span 
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: activeBoard?.color || '#3b82f6' }}
              />
              <span className="font-medium truncate">{activeBoard?.title || 'Document actif'}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>{tasks.length} tâche{tasks.length > 1 ? 's' : ''}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline text-amber-400">{todoCount} à faire</span>
            <span className="hidden sm:inline text-blue-400">{inProgressCount} en cours</span>
            <span className="hidden sm:inline text-emerald-400">{doneCount} terminée{doneCount > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5">
              {user ? (
                <span className="flex items-center space-x-1 text-emerald-400">
                  <CloudCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Google Cloud Synced</span>
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
              className="hover:text-blue-400 transition-colors cursor-pointer flex items-center space-x-1"
              title="Vérifier les mises à jour logicielles"
            >
              <RotateCw className="w-3 h-3 text-cyan-400" />
              <span>Mises à jour</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              Raccourcis & Aide
            </button>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {/* 1. Task Details Modal with Pencil Edit and Screenshot */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onOpenLightbox={(img) => setLightboxImage(img)}
        />
      )}

      {/* 2. New Task Modal */}
      {isNewTaskModalOpen && (
        <NewTaskModal
          initialStatus={newTaskInitialStatus}
          onClose={() => setIsNewTaskModalOpen(false)}
        />
      )}

      {/* 3. Document / Projects Manager Modal (.taskflow) */}
      {isDocManagerOpen && (
        <DocumentManagerModal
          onClose={() => setIsDocManagerOpen(false)}
        />
      )}

      {/* 4. Google Auth & Cloud Sync Modal */}
      {isAuthModalOpen && (
        <GoogleAuthModal
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* 5. Screenshot Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* 6. Settings & Updates Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* 7. About Modal */}
      {isAboutModalOpen && (
        <AboutModal
          onClose={() => setIsAboutModalOpen(false)}
        />
      )}

      {/* 8. GitHub Auto-Update Notification Banner (Electron Desktop) */}
      <UpdateNotification />
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <MainAppContent />
    </TaskProvider>
  );
}
