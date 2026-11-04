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
  Trash2, 
  Edit2, 
  Check, 
  Layers, 
  Settings,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { TaskFlowLogo } from './TaskFlowLogo';
import { Task } from '../types/task';

interface SidebarProps {
  onOpenNewDocModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSettingsModal?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewDocModal,
  onOpenAuthModal,
  onOpenSettingsModal,
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

  const { preferences, accentColorHex } = useSettings();
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

  const getBoardIcon = (iconName?: string, color: string = '#4285F4') => {
    const className = "w-4 h-4 shrink-0";
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

      {/* Google Navigation Drawer */}
      <aside
        className={`${
          isOpen ? 'w-72' : 'w-0 -translate-x-full lg:w-0'
        } transition-all duration-300 ease-in-out bg-[#1e1f20] border-r border-white/10 flex flex-col shrink-0 overflow-hidden select-none z-30 shadow-xl relative`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#191a1b]">
          <TaskFlowLogo size={30} showText={true} />
        </div>

        {/* Action: + Nouveau Projet (Google Keep FAB style pill) */}
        <div className="p-3">
          <button
            onClick={onOpenNewDocModal}
            className="w-full py-2.5 px-4 rounded-full bg-[#282a2d] hover:bg-[#323639] text-[#8ab4f8] hover:text-white border border-[#4285F4]/30 shadow-sm flex items-center justify-center space-x-2 text-xs font-semibold transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-[#4285F4] group-hover:scale-110 transition-transform" />
            <span>Nouveau document</span>
          </button>
        </div>

        {/* Section: Documents / Projets */}
        <div className="flex-1 px-3 py-1 overflow-y-auto space-y-1">
          <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center space-x-1.5 text-[#8ab4f8]">
              <Layers className="w-3.5 h-3.5" />
              <span>Vos Espaces & Projets</span>
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
              {boards.length}
            </span>
          </div>

          {/* Document list with Google rounded-full / rounded-2xl pills */}
          <div className="space-y-1 pt-1">
            {boards.map((board) => {
              const isActive = board.id === activeBoardId;
              const boardTasks = allTasks.filter((t: Task) => t.boardId === board.id);
              const doneTasks = boardTasks.filter((t: Task) => t.status === 'done').length;
              const accentColor = board.color || '#4285F4';

              return (
                <div
                  key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#004a77]/40 text-white font-medium border border-[#4285F4]/40 shadow-sm'
                      : 'hover:bg-[#282a2d] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate flex-1 min-w-0 pr-1">
                    <div 
                      className="p-1.5 rounded-xl shrink-0 flex items-center justify-center"
                      style={{ 
                        backgroundColor: isActive ? `${accentColor}30` : 'rgba(255, 255, 255, 0.05)',
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
                            className="bg-[#282a2d] border border-[#4285F4] rounded-lg px-2 py-0.5 text-xs text-white w-full outline-none"
                            autoFocus
                          />
                          <button
                            onClick={async () => {
                              if (editTitle.trim()) {
                                await updateBoard(board.id, { title: editTitle.trim() });
                              }
                              setEditingBoardId(null);
                            }}
                            className="p-1 bg-[#34A853] text-white rounded-md hover:bg-emerald-600"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs truncate font-medium">
                              {board.title}
                            </span>
                            {board.isCloud && (
                              <span title="Synchronisé dans Google Cloud">
                                <CloudCheck className="w-3 h-3 text-[#34A853] shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {boardTasks.length} tâche{boardTasks.length > 1 ? 's' : ''} ({doneTasks} terminées)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="hidden group-hover:flex items-center space-x-1 shrink-0 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBoardId(board.id);
                        setEditTitle(board.title);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                      title="Renommer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {boards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Supprimer le document "${board.title}" ?`)) {
                            deleteBoard(board.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-[#EA4335] rounded-lg hover:bg-white/10"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Panel: Import / Export & Google Cloud Card */}
        <div className="p-3 border-t border-white/10 bg-[#191a1b] space-y-2">
          {/* Import / Export quick buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-[#282a2d] hover:bg-[#323639] border border-white/10 rounded-xl text-[11px] text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              title="Importer un fichier .taskflow existant"
            >
              <Upload className="w-3 h-3 text-[#FBBC05]" />
              <span>Importer</span>
            </button>
            <button
              onClick={() => exportBoardToFile(activeBoardId)}
              className="flex-1 py-1.5 px-2 bg-[#282a2d] hover:bg-[#323639] border border-white/10 rounded-xl text-[11px] text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              title="Exporter le document actif"
            >
              <Download className="w-3 h-3 text-[#34A853]" />
              <span>Exporter</span>
            </button>
          </div>

          {/* User Cloud Card */}
          <div 
            onClick={onOpenAuthModal}
            className="p-2.5 rounded-2xl bg-[#282a2d] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-[#323639] transition-all"
          >
            <div className="flex items-center space-x-2.5 truncate">
              {user ? (
                user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-[#34A853]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xs">
                    {user.email ? user.email[0].toUpperCase() : 'G'}
                  </div>
                )
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/10 text-slate-400 flex items-center justify-center">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user ? (user.displayName || user.email?.split('@')[0]) : 'Mode Local'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user ? 'Google Cloud Sync actif' : 'Connecter un compte'}
                </p>
              </div>
            </div>
            {user && (
              <span className="w-2 h-2 rounded-full bg-[#34A853] shrink-0 shadow-sm" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
