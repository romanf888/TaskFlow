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
  FolderPlus,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  FolderTree,
  FolderOpen,
  GripVertical,
  Users,
  Key,
  LogOut,
  Share2,
  BookOpen,
  Globe
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { TaskFlowLogo } from './TaskFlowLogo';
import { Task, BoardDocument, BoardSortPreference } from '../types/task';

interface SidebarProps {
  onOpenNewDocModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSettingsModal?: () => void;
  onOpenTeamModal?: (mode?: 'create' | 'join' | 'manage', code?: string) => void;
  onOpenHomeScreen?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewDocModal,
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenTeamModal,
  onOpenHomeScreen,
  isOpen,
  onToggle,
}) => {
  const {
    boards,
    sortedBoards,
    activeBoardId,
    setActiveBoardId,
    projects,
    teamSessions = [],
    boardSortPreference,
    setBoardSortPreference,
    moveBoardOrder,
    reorderBoards,
    createProject,
    deleteProject,
    renameProject,
    assignBoardToProject,
    reorderProjects,
    leaveTeamSession,
    allTasks = [],
    exportBoardToFile,
    importBoardFromFile,
    deleteBoard,
    updateBoard,
    user,
    syncStatus,
  } = useTaskContext();

  const { preferences, effectiveTheme, isLiquidGlass } = useSettings();
  const isLight = effectiveTheme === 'light';

  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Project creation state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectName, setEditingProjectName] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState('');

  // Project collapse state
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

  // Sort dropdown state
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Active menu for assigning document to project
  const [openAssignMenuDocId, setOpenAssignMenuDocId] = useState<string | null>(null);

  // Mouse drag & drop state & refs for boards
  const draggedBoardRef = useRef<string | null>(null);
  const [draggedBoardId, setDraggedBoardId] = useState<string | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null);
  const [dragOverProjectName, setDragOverProjectName] = useState<string | null>(null);

  // Mouse drag & drop state & refs for project sections
  const draggedProjectRef = useRef<string | null>(null);
  const [draggedProjectName, setDraggedProjectName] = useState<string | null>(null);
  const [dragOverTargetProjectName, setDragOverTargetProjectName] = useState<string | null>(null);
  const [dragOverProjectPosition, setDragOverProjectPosition] = useState<'before' | 'after' | null>(null);

  // Direct Pointer/Mouse Drag & Drop State for Documents
  const [pointerDragBoardId, setPointerDragBoardId] = useState<string | null>(null);
  const [pointerDragPos, setPointerDragPos] = useState<{ x: number; y: number } | null>(null);
  const [pointerDragTargetId, setPointerDragTargetId] = useState<string | null>(null);
  const [pointerDragInsertPos, setPointerDragInsertPos] = useState<'before' | 'after' | null>(null);
  const [pointerDragTargetProject, setPointerDragTargetProject] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleProjectCollapse = (projectName: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectName]: !prev[projectName],
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importBoardFromFile(file);
      e.target.value = '';
    }
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingProject(false);
    }
  };

  // --- Pointer/Mouse Hold & Drag Handler for Documents ---
  const handleDocumentPointerDown = (e: React.PointerEvent, boardId: string) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    if (e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (!isDragging && dist > 4) {
        isDragging = true;
        setPointerDragBoardId(boardId);
        draggedBoardRef.current = boardId;
      }

      if (isDragging) {
        setPointerDragPos({ x: moveEvent.clientX, y: moveEvent.clientY });

        const elem = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        if (elem) {
          const boardElem = elem.closest('[data-board-id]') as HTMLElement;
          const projectElem = elem.closest('[data-project-name]') as HTMLElement;

          if (boardElem) {
            const targetId = boardElem.getAttribute('data-board-id');
            if (targetId && targetId !== boardId) {
              const rect = boardElem.getBoundingClientRect();
              const isAfter = (moveEvent.clientY - rect.top) > (rect.height / 2);
              setPointerDragTargetId(targetId);
              setPointerDragInsertPos(isAfter ? 'after' : 'before');
              setPointerDragTargetProject(null);
              return;
            }
          }

          if (projectElem) {
            const projName = projectElem.getAttribute('data-project-name');
            if (projName) {
              setPointerDragTargetProject(projName);
              setPointerDragTargetId(null);
              setPointerDragInsertPos(null);
              return;
            }
          }
        }

        setPointerDragTargetId(null);
        setPointerDragInsertPos(null);
        setPointerDragTargetProject(null);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (isDragging) {
        const elem = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        if (elem) {
          const boardElem = elem.closest('[data-board-id]') as HTMLElement;
          const projectElem = elem.closest('[data-project-name]') as HTMLElement;

          if (boardElem) {
            const targetId = boardElem.getAttribute('data-board-id');
            if (targetId && targetId !== boardId) {
              const currentList = [...boards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              const sourceBoard = currentList.find(b => b.id === boardId);
              const targetBoard = currentList.find(b => b.id === targetId);

              if (sourceBoard && targetBoard) {
                const remaining = currentList.filter(b => b.id !== boardId);
                const targetIndex = remaining.findIndex(b => b.id === targetId);
                if (targetIndex !== -1) {
                  const rect = boardElem.getBoundingClientRect();
                  const isAfter = (upEvent.clientY - rect.top) > (rect.height / 2);
                  const insertIndex = isAfter ? targetIndex + 1 : targetIndex;

                  const updatedSource = {
                    ...sourceBoard,
                    projectName: targetBoard.projectName
                  };

                  remaining.splice(insertIndex, 0, updatedSource);
                  reorderBoards(remaining);
                }
              }
            }
          } else if (projectElem) {
            const projName = projectElem.getAttribute('data-project-name');
            const targetProj = (projName === '__none__' || !projName) ? undefined : projName;
            assignBoardToProject(boardId, targetProj);
          }
        }
      }

      setPointerDragBoardId(null);
      setPointerDragPos(null);
      setPointerDragTargetId(null);
      setPointerDragInsertPos(null);
      setPointerDragTargetProject(null);
      draggedBoardRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // --- Document (Board) Drag and Drop Handlers ---
  const handleBoardDragStart = (e: React.DragEvent, boardId: string) => {
    draggedBoardRef.current = boardId;
    setDraggedBoardId(boardId);
    try {
      e.dataTransfer.setData('text/plain', boardId);
      e.dataTransfer.setData('application/taskflow-board', boardId);
    } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBoardDragEnd = () => {
    draggedBoardRef.current = null;
    setDraggedBoardId(null);
    setDragOverBoardId(null);
    setDragOverPosition(null);
    setDragOverProjectName(null);
  };

  // Drop on another document to reorder before or after
  const handleBoardDropOnBoard = (e: React.DragEvent, targetBoard: BoardDocument) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('application/taskflow-board') || e.dataTransfer.getData('text/plain') || draggedBoardRef.current || draggedBoardId;
    if (!sourceId || sourceId === targetBoard.id) {
      handleBoardDragEnd();
      return;
    }

    const currentList = [...boards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const sourceBoard = currentList.find(b => b.id === sourceId);
    if (!sourceBoard) {
      handleBoardDragEnd();
      return;
    }

    // Remove source from list
    const remaining = currentList.filter(b => b.id !== sourceId);
    const targetIndex = remaining.findIndex(b => b.id === targetBoard.id);
    if (targetIndex === -1) {
      handleBoardDragEnd();
      return;
    }

    const insertIndex = dragOverPosition === 'after' ? targetIndex + 1 : targetIndex;

    // Place and inherit target project grouping
    const updatedSource = {
      ...sourceBoard,
      projectName: targetBoard.projectName
    };

    remaining.splice(insertIndex, 0, updatedSource);
    reorderBoards(remaining);

    handleBoardDragEnd();
  };

  // Drop directly onto a project folder to classify document
  const handleBoardDropOnProject = (e: React.DragEvent, projectName?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('application/taskflow-board') || e.dataTransfer.getData('text/plain') || draggedBoardRef.current || draggedBoardId;
    if (!sourceId) {
      handleBoardDragEnd();
      return;
    }

    assignBoardToProject(sourceId, projectName);
    handleBoardDragEnd();
  };

  // --- Project Section Drag and Drop Handlers (Reorder Projects) ---
  const handleProjectDragStart = (e: React.DragEvent, projName: string) => {
    draggedProjectRef.current = projName;
    setDraggedProjectName(projName);
    try {
      e.dataTransfer.setData('text/plain', projName);
      e.dataTransfer.setData('application/taskflow-project', projName);
    } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragEnd = () => {
    draggedProjectRef.current = null;
    setDraggedProjectName(null);
    setDragOverTargetProjectName(null);
    setDragOverProjectPosition(null);
  };

  const handleProjectDropOnProject = (e: React.DragEvent, targetProject: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceProject = e.dataTransfer.getData('application/taskflow-project') || e.dataTransfer.getData('text/plain') || draggedProjectRef.current || draggedProjectName;
    if (!sourceProject || sourceProject === targetProject) {
      handleProjectDragEnd();
      return;
    }

    const remainingProjects = projects.filter((p) => p !== sourceProject);
    const targetIndex = remainingProjects.indexOf(targetProject);
    if (targetIndex === -1) {
      handleProjectDragEnd();
      return;
    }

    const insertIndex = dragOverProjectPosition === 'after' ? targetIndex + 1 : targetIndex;
    remainingProjects.splice(insertIndex, 0, sourceProject);
    reorderProjects(remainingProjects);
    handleProjectDragEnd();
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

  // Group sorted boards by project
  const groupedBoards: { project: string; boards: BoardDocument[] }[] = [];
  const noProjectBoards: BoardDocument[] = [];

  // Grouping
  projects.forEach((proj) => {
    const projBoards = sortedBoards.filter((b) => b.projectName === proj);
    groupedBoards.push({ project: proj, boards: projBoards });
  });

  // Boards without project or with unlisted project
  sortedBoards.forEach((b) => {
    if (!b.projectName || !projects.includes(b.projectName)) {
      noProjectBoards.push(b);
    }
  });

  const renderBoardItem = (board: BoardDocument) => {
    const isActive = board.id === activeBoardId;
    const isDragged = draggedBoardId === board.id;
    const isDragOver = dragOverBoardId === board.id;
    const boardTasks = allTasks.filter((t: Task) => t.boardId === board.id);
    const doneTasks = boardTasks.filter((t: Task) => t.status === 'done').length;
    const accentColor = board.color || '#4285F4';

    const isPointerDragOver = pointerDragTargetId === board.id;
    const isPointerDragged = pointerDragBoardId === board.id;

    return (
      <div
        key={board.id}
        data-board-id={board.id}
        draggable
        onPointerDown={(e) => handleDocumentPointerDown(e, board.id)}
        onDragStart={(e) => handleBoardDragStart(e, board.id)}
        onDragEnd={handleBoardDragEnd}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          const sourceId = draggedBoardRef.current || draggedBoardId;
          if (sourceId && sourceId !== board.id) {
            const rect = e.currentTarget.getBoundingClientRect();
            const isAfter = (e.clientY - rect.top) > (rect.height / 2);
            setDragOverBoardId(board.id);
            setDragOverPosition(isAfter ? 'after' : 'before');
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          if (dragOverBoardId === board.id) {
            setDragOverBoardId(null);
            setDragOverPosition(null);
          }
        }}
        onDrop={(e) => handleBoardDropOnBoard(e, board)}
        onClick={() => {
          setActiveBoardId(board.id);
          setOpenAssignMenuDocId(null);
        }}
        title="Maintenez le clic pour faire glisser et réordonner le document"
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
          isDragged || isPointerDragged ? 'opacity-35 scale-[0.98]' : ''
        } ${
          isActive
            ? isLight
              ? 'bg-[#e8f0fe] text-[#1967d2] font-semibold border border-[#4285F4]/40 shadow-xs'
              : 'bg-[#004a77]/40 text-white font-medium border border-[#4285F4]/40 shadow-sm'
            : isLight
            ? 'hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 border border-transparent'
            : 'hover:bg-[#282a2d] text-slate-300 hover:text-white border border-transparent'
        }`}
      >
        {/* Drop Insertion Line Indicator */}
        {((isDragOver && dragOverPosition === 'before') || (isPointerDragOver && pointerDragInsertPos === 'before')) && (
          <div className="absolute -top-1 left-1.5 right-1.5 h-[2.5px] bg-[#4285F4] rounded-full z-30 pointer-events-none flex items-center shadow-md shadow-[#4285F4]/50">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4285F4] -ml-1 ring-2 ring-white dark:ring-slate-900" />
          </div>
        )}
        {((isDragOver && dragOverPosition === 'after') || (isPointerDragOver && pointerDragInsertPos === 'after')) && (
          <div className="absolute -bottom-1 left-1.5 right-1.5 h-[2.5px] bg-[#4285F4] rounded-full z-30 pointer-events-none flex items-center shadow-md shadow-[#4285F4]/50">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4285F4] -ml-1 ring-2 ring-white dark:ring-slate-900" />
          </div>
        )}
        <div className="flex items-center space-x-2 truncate flex-1 min-w-0 pr-1">
          {/* Grip handle for mouse dragging */}
          <GripVertical className={`w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`} />

          <div 
            className="p-1.5 rounded-lg shrink-0 flex items-center justify-center shadow-xs"
            style={{ 
              backgroundColor: isActive 
                ? `${accentColor}30` 
                : isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)',
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
                  className={`border border-[#4285F4] rounded px-1.5 py-0.5 text-xs outline-none w-full ${
                    isLight ? 'bg-white text-slate-900' : 'bg-[#282a2d] text-white'
                  }`}
                  autoFocus
                />
                <button
                  onClick={async () => {
                    if (editTitle.trim()) {
                      await updateBoard(board.id, { title: editTitle.trim() });
                    }
                    setEditingBoardId(null);
                  }}
                  className="p-1 bg-[#34A853] text-white rounded hover:bg-emerald-600"
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
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {boardTasks.length} tâche{boardTasks.length > 1 ? 's' : ''} ({doneTasks} faites)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hover Controls: Up/Down reorder + Move to project + Rename/Delete */}
        <div 
          className="hidden group-hover:flex items-center space-x-0.5 shrink-0 ml-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Reorder Up/Down */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveBoardOrder(board.id, 'up');
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Monter le document (ou glisser à la souris)"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveBoardOrder(board.id, 'down');
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
            title="Descendre le document (ou glisser à la souris)"
          >
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Assign to Project Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenAssignMenuDocId(openAssignMenuDocId === board.id ? null : board.id);
              }}
              className={`p-1 rounded hover:bg-black/10 transition-colors ${
                isLight ? 'text-slate-500 hover:text-[#4285F4]' : 'text-slate-400 hover:text-[#8ab4f8]'
              }`}
              title="Classer dans un projet (ou glisser directement sur le dossier)"
            >
              <FolderTree className="w-3 h-3" />
            </button>

            {openAssignMenuDocId === board.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute right-0 top-7 w-48 rounded-xl shadow-xl border p-1.5 z-50 text-xs animate-in fade-in ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-[#282a2d] border-white/20 text-slate-200'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Classer dans un projet :
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj}
                    onClick={() => {
                      assignBoardToProject(board.id, proj);
                      setOpenAssignMenuDocId(null);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      board.projectName === proj
                        ? 'bg-[#4285F4]/20 text-[#4285F4] font-semibold'
                        : isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{proj}</span>
                    {board.projectName === proj && <Check className="w-3 h-3" />}
                  </button>
                ))}
                {board.projectName && (
                  <button
                    onClick={() => {
                      assignBoardToProject(board.id, undefined);
                      setOpenAssignMenuDocId(null);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-amber-500 transition-colors cursor-pointer text-xs ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                    }`}
                  >
                    Retirer du projet
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingBoardId(board.id);
              setEditTitle(board.title);
            }}
            className={`p-1 rounded hover:bg-black/10 transition-colors ${
              isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
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
              className="p-1 text-slate-400 hover:text-[#EA4335] rounded hover:bg-black/10"
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
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

      {/* Navigation Drawer */}
      <aside
        className={`${
          isOpen ? 'w-76' : 'w-0 -translate-x-full lg:w-0'
        } transition-all duration-300 ease-in-out ${
          isLiquidGlass
            ? 'bg-[#060913]/70 border-r border-white/15 text-slate-100 backdrop-blur-3xl shadow-2xl'
            : isLight 
            ? 'bg-white/90 border-r border-black/10 text-slate-800 backdrop-blur-2xl' 
            : 'bg-[#1c1c1e]/90 border-r border-white/10 text-slate-200 backdrop-blur-2xl'
        } flex flex-col shrink-0 overflow-hidden select-none z-30 shadow-xl relative`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLiquidGlass ? 'bg-white/5 border-white/10' : isLight ? 'bg-white/50 border-black/10' : 'bg-black/30 border-white/10'
        }`}>
          <TaskFlowLogo size={30} showText={true} />
        </div>

        {/* Actions: + Nouveau Document & Accueil/Modèles */}
        <div className="p-3 space-y-2">
          <button
            onClick={onOpenNewDocModal}
            className="w-full py-2.5 px-4 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white shadow-md shadow-[#007AFF]/25 flex items-center justify-center space-x-2 text-xs font-semibold apple-btn-active transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>Nouveau document</span>
          </button>

          {onOpenHomeScreen && (
            <button
              onClick={onOpenHomeScreen}
              className={`w-full py-2 px-4 rounded-full border flex items-center justify-center space-x-2 text-xs font-semibold apple-btn-active transition-all cursor-pointer ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Accueil & Modèles</span>
            </button>
          )}
        </div>

        {/* Section: Documents / Categories Bar */}
        <div className="px-3 pt-1 pb-2 border-b flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
          <span className="flex items-center space-x-1.5 text-[#4285F4]">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Catégories du Document</span>
          </span>

          <div className="flex items-center space-x-1">
            {/* Create Category Button */}
            <button
              onClick={() => setIsCreatingProject(!isCreatingProject)}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
              title="Créer une nouvelle catégorie dans ce document"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            {/* Sort Options Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className={`p-1 rounded-md transition-colors cursor-pointer flex items-center space-x-0.5 ${
                  isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
                title="Trier l'ordre des documents"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              {showSortDropdown && (
                <div
                  onClick={() => setShowSortDropdown(false)}
                  className={`absolute right-0 top-6 w-48 rounded-xl shadow-2xl border p-1.5 z-50 animate-in fade-in ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-800' 
                      : 'bg-[#282a2d] border-white/20 text-slate-200'
                  }`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Trier les documents :
                  </div>
                  {[
                    { id: 'custom', label: 'Ordre personnalisé (glisser / monter)' },
                    { id: 'title-asc', label: 'Nom (A → Z)' },
                    { id: 'title-desc', label: 'Nom (Z → A)' },
                    { id: 'date-desc', label: 'Plus récents d’abord' },
                    { id: 'date-asc', label: 'Plus anciens d’abord' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setBoardSortPreference(s.id as BoardSortPreference);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        boardSortPreference === s.id
                          ? 'bg-[#4285F4]/20 text-[#4285F4] font-bold'
                          : isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                      }`}
                    >
                      <span>{s.label}</span>
                      {boardSortPreference === s.id && <Check className="w-3 h-3 text-[#4285F4]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'
            }`}>
              {boards.length}
            </span>
          </div>
        </div>

        {/* Drag & Drop Hint Helper */}
        {(draggedBoardId || draggedProjectName) && (
          <div className="mx-3 mt-1.5 p-2 bg-[#4285F4]/15 border border-[#4285F4]/40 rounded-xl text-[10.5px] text-[#4285F4] text-center animate-pulse flex items-center justify-between">
            <span>
              {draggedBoardId 
                ? 'Glissez sur un document pour réordonner, ou sur une catégorie pour le classer'
                : 'Glissez pour réordonner les catégories'}
            </span>
            <button 
              onClick={() => {
                handleBoardDragEnd();
                handleProjectDragEnd();
              }}
              className="text-[10px] underline ml-2 cursor-pointer hover:text-blue-700"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Inline Create Category Form */}
        {isCreatingProject && (
          <form 
            onSubmit={handleCreateProjectSubmit}
            className={`p-3 m-2 rounded-xl border animate-in fade-in space-y-2 ${
              isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-[#282a2d] border-white/15'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#4285F4]">
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Nouvelle Catégorie dans ce Document</span>
            </div>
            <input
              type="text"
              placeholder="Ex: Développements, Scolaire, Personnel, Projets..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className={`w-full border rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#4285F4] ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/20 text-white'
              }`}
              autoFocus
            />
            <div className="flex justify-end space-x-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] ${
                  isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-md text-[11px] font-semibold cursor-pointer"
              >
                Créer la catégorie
              </button>
            </div>
          </form>
        )}

        {/* Tree List: Project Folders & Grouped Documents */}
        <div className="flex-1 px-2.5 py-2 overflow-y-auto space-y-3">
          {/* Projects and their documents */}
          {groupedBoards.map(({ project, boards: projBoards }) => {
            const isCollapsed = !!collapsedProjects[project];
            const isProjectDragOver = dragOverProjectName === project;

            return (
              <div 
                key={project} 
                data-project-name={project}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverProjectName !== project) {
                    setDragOverProjectName(project);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverProjectName === project) {
                    setDragOverProjectName(null);
                  }
                }}
                onDrop={(e) => handleBoardDropOnProject(e, project)}
                className={`rounded-xl transition-all p-1 ${
                  isProjectDragOver || pointerDragTargetProject === project
                    ? isLight
                      ? 'border-2 border-dashed border-[#1967d2] bg-blue-100/60 ring-2 ring-blue-300'
                      : 'border-2 border-dashed border-[#4285F4] bg-[#4285F4]/20 ring-2 ring-[#4285F4]/40'
                    : 'border border-transparent'
                }`}
              >
                {/* Project Header Row */}
                <div 
                  draggable={!editingProjectName}
                  onDragStart={(e) => handleProjectDragStart(e, project)}
                  onDragEnd={handleProjectDragEnd}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    if (draggedProjectName && draggedProjectName !== project) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const isAfter = (e.clientY - rect.top) > (rect.height / 2);
                      setDragOverTargetProjectName(project);
                      setDragOverProjectPosition(isAfter ? 'after' : 'before');
                    } else if (draggedBoardId) {
                      if (dragOverProjectName !== project) {
                        setDragOverProjectName(project);
                      }
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    if (dragOverTargetProjectName === project) {
                      setDragOverTargetProjectName(null);
                      setDragOverProjectPosition(null);
                    }
                  }}
                  onDrop={(e) => {
                    if (draggedProjectName) {
                      handleProjectDropOnProject(e, project);
                    } else if (draggedBoardId) {
                      handleBoardDropOnProject(e, project);
                    }
                  }}
                  onClick={() => toggleProjectCollapse(project)}
                  title="Cliquez pour plier/déplier, ou glissez à la souris pour réordonner la section"
                  className={`group relative flex items-center justify-between px-2 py-1.5 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${
                    isLight ? 'hover:bg-slate-200/60' : 'hover:bg-[#282a2d]/80'
                  }`}
                >
                  {/* Drop guide line for project reorder */}
                  {dragOverTargetProjectName === project && dragOverProjectPosition === 'before' && (
                    <div className="absolute -top-1 left-1 right-1 h-[2.5px] bg-[#FBBC05] rounded-full z-30 pointer-events-none flex items-center shadow-md shadow-[#FBBC05]/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC05] -ml-1 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                  )}
                  {dragOverTargetProjectName === project && dragOverProjectPosition === 'after' && (
                    <div className="absolute -bottom-1 left-1 right-1 h-[2.5px] bg-[#FBBC05] rounded-full z-30 pointer-events-none flex items-center shadow-md shadow-[#FBBC05]/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC05] -ml-1 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                    <GripVertical className={`w-3 h-3 shrink-0 opacity-30 group-hover:opacity-80 transition-opacity ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <span className="text-slate-400">
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-amber-400">
                      {isCollapsed ? <Folder className="w-3.5 h-3.5" /> : <FolderOpen className="w-3.5 h-3.5" />}
                    </span>
                    
                    {editingProjectName === project ? (
                      <div 
                        className="flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editProjectTitle}
                          onChange={(e) => setEditProjectTitle(e.target.value)}
                          className={`border border-[#4285F4] rounded px-1.5 py-0.5 text-xs outline-none ${
                            isLight ? 'bg-white text-slate-900' : 'bg-black text-white'
                          }`}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            renameProject(project, editProjectTitle);
                            setEditingProjectName(null);
                          }}
                          className="p-1 bg-[#34A853] text-white rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold truncate ${
                        isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        {project}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-1">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-slate-400'
                    }`}>
                      {projBoards.length}
                    </span>

                    <div className="hidden group-hover:flex items-center space-x-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectName(project);
                          setEditProjectTitle(project);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-black/10"
                        title="Renommer le projet"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Supprimer le dossier de projet "${project}" ? (Les documents ne seront pas effacés mais retirés de ce projet)`)) {
                            deleteProject(project);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-black/10"
                        title="Supprimer ce projet"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Documents inside this project */}
                {!isCollapsed && (
                  <div className="pl-3 border-l-2 border-[#4285F4]/30 ml-3 space-y-1 mt-1">
                    {projBoards.length === 0 ? (
                      <div className="py-2 px-2 text-[10.5px] text-slate-400 italic border border-dashed border-slate-300/30 rounded-lg text-center">
                        Glissez un document ici pour le classer
                      </div>
                    ) : (
                      projBoards.map((b) => renderBoardItem(b))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Documents with no assigned project */}
          <div 
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverProjectName !== '__none__') {
                setDragOverProjectName('__none__');
              }
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              if (dragOverProjectName === '__none__') {
                setDragOverProjectName(null);
              }
            }}
            onDrop={(e) => handleBoardDropOnProject(e, undefined)}
            className={`space-y-1 pt-2 rounded-xl transition-all p-1 ${
              dragOverProjectName === '__none__' 
                ? isLight 
                  ? 'border-2 border-dashed border-[#1967d2] bg-blue-100/60' 
                  : 'border-2 border-dashed border-[#4285F4] bg-[#4285F4]/20'
                : 'border border-transparent'
            }`}
          >
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Folder className="w-3 h-3 text-slate-400" />
                <span>Documents non classés ({noProjectBoards.length})</span>
              </span>
              {draggedBoardId && (
                <span className="text-[9px] text-[#4285F4] lowercase font-normal">Déposer pour sortir du projet</span>
              )}
            </div>
            <div className="space-y-1">
              {noProjectBoards.length === 0 && draggedBoardId ? (
                <div className="py-2 px-2 text-[10.5px] text-slate-400 italic border border-dashed border-slate-300/30 rounded-lg text-center">
                  Déposer ici pour retirer le document de son projet
                </div>
              ) : (
                noProjectBoards.map((b) => renderBoardItem(b))
              )}
            </div>
          </div>

          {/* Section: Documents d'Équipe & Collaboration */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="px-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#34A853]">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#34A853]" />
                <span>Équipes & Documents Partagés</span>
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onOpenTeamModal?.('create')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Créer une nouvelle session d'équipe (+ code)"
                >
                  <Plus className="w-3.5 h-3.5 text-[#34A853]" />
                </button>
                <button
                  onClick={() => onOpenTeamModal?.('join')}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Rejoindre une équipe par code de session"
                >
                  <Key className="w-3.5 h-3.5 text-[#34A853]" />
                </button>
              </div>
            </div>

            {teamSessions.length === 0 ? (
              <div className={`p-3 rounded-2xl border border-dashed text-center text-xs space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-500' : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                <p className="text-[11px]">Aucune session d'équipe active.</p>
                <button
                  onClick={() => onOpenTeamModal?.('join')}
                  className="text-[#4285F4] underline text-[11px] font-semibold cursor-pointer"
                >
                  Rejoindre avec un code →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {teamSessions.map((session) => {
                  const teamBoards = boards.filter((b) => b.teamSessionCode === session.code);

                  return (
                    <div
                      key={session.id}
                      className={`rounded-2xl border p-2 space-y-1.5 ${
                        isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate">
                          <Users className="w-3.5 h-3.5 text-[#34A853] shrink-0" />
                          <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            {session.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <span className="px-1.5 py-0.2 rounded-full bg-[#34A853]/20 text-[#34A853] font-mono text-[9.5px] font-bold">
                            {session.code}
                          </span>
                          <button
                            onClick={() => onOpenTeamModal?.('manage', session.code)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-black/10"
                            title="Gérer l'équipe & copier le code"
                          >
                            <Settings className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Shared documents for this team session */}
                      <div className="space-y-1 pt-0.5">
                        {teamBoards.length === 0 ? (
                          <div className="text-[10.5px] text-slate-400 italic px-2 py-1">
                            Aucun document d'équipe. Cliquez sur le menu pour en créer un.
                          </div>
                        ) : (
                          teamBoards.map((b) => renderBoardItem(b))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Panel: Import / Export & User Account Card */}
        <div className={`p-3 border-t space-y-2 ${
          isLight ? 'bg-white border-slate-300' : 'bg-[#191a1b] border-white/10'
        }`}>
          {/* Import / Export quick buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 py-1.5 px-2 border rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-[#282a2d] hover:bg-[#323639] border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Importer un fichier .taskflow existant"
            >
              <Upload className="w-3 h-3 text-[#FBBC05]" />
              <span>Importer</span>
            </button>
            <button
              onClick={() => exportBoardToFile(activeBoardId)}
              className={`flex-1 py-1.5 px-2 border rounded-xl text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                  : 'bg-[#282a2d] hover:bg-[#323639] border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Exporter le document actif"
            >
              <Download className="w-3 h-3 text-[#34A853]" />
              <span>Exporter</span>
            </button>
          </div>

          {/* User Cloud Card */}
          <div 
            onClick={onOpenAuthModal}
            className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
              isLight 
                ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' 
                : 'bg-[#282a2d] border-white/10 hover:bg-[#323639]'
            }`}
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-slate-400'
                }`}>
                  <Cloud className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="truncate">
                <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {user ? (user.displayName || user.email?.split('@')[0]) : 'Mode Local'}
                </p>
                {user?.email && (
                  <p className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            {user && (
              <span className="w-2 h-2 rounded-full bg-[#34A853] shrink-0 shadow-sm" />
            )}
          </div>
        </div>
      </aside>

      {/* Floating Mouse/Pointer Drag Badge Preview */}
      {pointerDragBoardId && pointerDragPos && (
        <div
          style={{
            position: 'fixed',
            left: pointerDragPos.x + 14,
            top: pointerDragPos.y + 14,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="px-3.5 py-2 bg-[#4285F4] text-white rounded-2xl shadow-2xl border border-white/30 text-xs font-bold flex items-center space-x-2 animate-in fade-in"
        >
          <GripVertical className="w-4 h-4 text-white/80" />
          <span>Déplacement : {boards.find(b => b.id === pointerDragBoardId)?.title || 'Document'}</span>
        </div>
      )}
    </>
  );
};
