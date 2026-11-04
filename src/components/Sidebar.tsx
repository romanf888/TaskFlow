import React, { useState, useRef } from 'react';
import { 
  Folder, 
  Briefcase, 
  Home, 
  Code, 
  Rocket, 
  Star, 
  Plus, 
  Download, 
  Upload, 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RotateCw, 
  Trash2, 
  Edit2, 
  Check, 
  Layers, 
  CheckSquare, 
  Sparkles,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { Task } from '../types/task';

interface SidebarProps {
  onOpenNewDocModal: () => void;
  onOpenAuthModal: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewDocModal,
  onOpenAuthModal,
  isOpen,
  onToggle,
}) => {
  const {
    boards,
    activeBoardId,
    setActiveBoardId,
    allTasks = [],
    exportBoardToFile,
    importBoardFromFile,
    deleteBoard,
    updateBoard,
    user,
    syncStatus,
  } = useTaskContext();

  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importBoardFromFile(file);
      e.target.value = '';
    }
  };

  const getBoardIcon = (iconName?: string, color: string = '#3b82f6') => {
    const className = "w-4 h-4 shrink-0 transition-transform group-hover:scale-110";
    switch (iconName) {
      case 'briefcase':
        return <Briefcase className={className} style={{ color }} />;
      case 'home':
        return <Home className={className} style={{ color }} />;
      case 'code':
        return <Code className={className} style={{ color }} />;
      case 'rocket':
        return <Rocket className={className} style={{ color }} />;
      case 'star':
        return <Star className={className} style={{ color }} />;
      default:
        return <Folder className={className} style={{ color }} />;
    }
  };

  return (
    <>
      {/* Hidden file input for .taskflow file import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".taskflow,.json"
        className="hidden"
      />

      {/* Sidebar Container */}
      <aside
        className={`${
          isOpen ? 'w-72' : 'w-0 -translate-x-full lg:w-0'
        } transition-all duration-300 ease-in-out bg-[#121522] border-r border-white/10 flex flex-col shrink-0 overflow-hidden select-none z-30 shadow-2xl relative`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161a2b]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-[10px] text-blue-400 font-medium">
                Gestionnaire de Tâches
              </p>
            </div>
          </div>
        </div>

        {/* Section: Documents / Fichiers de tâches (1-clic pour changer) */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
          <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5 text-blue-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Mes Fichiers / Documents</span>
            </span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-300">
              {boards.length}
            </span>
          </div>

          <p className="px-2 pb-2 text-[11px] text-slate-500">
            Cliquez sur un document pour afficher son tableau Kanban :
          </p>

          {/* Document list */}
          <div className="space-y-1.5">
            {boards.map((board) => {
              const isActive = board.id === activeBoardId;
              const boardTasks = allTasks.filter((t: Task) => t.boardId === board.id);
              const doneTasks = boardTasks.filter((t: Task) => t.status === 'done').length;
              const accentColor = board.color || '#3b82f6';

              return (
                <div
                  key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  style={{
                    borderLeftColor: isActive ? accentColor : 'transparent',
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg border-l-4 transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1e2438] text-white shadow-md shadow-black/30 border-t border-r border-b border-white/10 ring-1 ring-white/10'
                      : 'bg-[#151928]/60 hover:bg-[#1b2033] text-slate-300 hover:text-white border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0 pr-2">
                    <div 
                      className="p-1.5 rounded-md shrink-0 flex items-center justify-center transition-colors"
                      style={{ 
                        backgroundColor: isActive ? `${accentColor}25` : '#1a1f30',
                      }}
                    >
                      {getBoardIcon(board.icon, accentColor)}
                    </div>

                    <div className="truncate flex-1">
                      {editingBoardId === board.id ? (
                        <div 
                          className="flex items-center space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-[#242b3e] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white w-full"
                            autoFocus
                          />
                          <button
                            onClick={async () => {
                              if (editTitle.trim()) {
                                await updateBoard(board.id, { title: editTitle.trim() });
                              }
                              setEditingBoardId(null);
                            }}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <h4 className="font-semibold text-xs truncate">
                          {board.title}
                        </h4>
                      )}

                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span 
                          className="font-medium"
                          style={{ color: isActive ? accentColor : undefined }}
                        >
                          {boardTasks.length} tâche{boardTasks.length > 1 ? 's' : ''}
                        </span>
                        {boardTasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">
                              {doneTasks} faite{doneTasks > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right actions: quick download or rename on hover */}
                  <div 
                    className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => exportBoardToFile(board.id)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-sky-300 transition-colors"
                      title="Télécharger ce document (.taskflow)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingBoardId(board.id);
                        setEditTitle(board.title);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Renommer le document"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {boards.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer le document "${board.title}" ?`)) {
                            deleteBoard(board.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Supprimer ce document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isActive && (
                    <div 
                      className="w-1.5 h-1.5 rounded-full shrink-0 ml-1.5"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Document button */}
          <button
            onClick={onOpenNewDocModal}
            className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600 hover:to-indigo-600 border border-blue-500/40 text-blue-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouveau Document</span>
          </button>

          {/* Import file button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-1.5 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Ouvrir un fichier .taskflow</span>
          </button>
        </div>

        {/* Bottom User Profile & Cloud Sync Bar */}
        <div className="p-3 border-t border-white/10 bg-[#161a2b]">
          {user ? (
            <div 
              onClick={onOpenAuthModal}
              className="flex items-center justify-between p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-emerald-500/30 cursor-pointer transition-colors"
              title="Gérer la synchronisation Google"
            >
              <div className="flex items-center space-x-2.5 truncate">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-emerald-400" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div className="truncate text-left">
                  <p className="font-semibold text-xs text-white truncate leading-tight">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </p>
                  <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                    <CloudCheck className="w-3 h-3" />
                    <span>Cloud Sync Actif</span>
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Connecter Google Cloud</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
