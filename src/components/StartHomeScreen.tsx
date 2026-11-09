import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Layers, 
  Code, 
  Rocket, 
  Sparkles, 
  Briefcase, 
  Home, 
  Folder, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Upload, 
  Download, 
  Settings, 
  Users, 
  ArrowRight, 
  Star, 
  Trash2, 
  Copy, 
  Monitor, 
  HardDrive, 
  RefreshCw, 
  X,
  FolderPlus,
  Cloud,
  Check,
  Tag,
  Sun,
  Moon,
  Edit2,
  Minus,
  Square,
  Maximize2
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { TaskFlowLogo } from './TaskFlowLogo';
import { TEMPLATES_CATALOG, TaskFlowTemplate } from '../data/templatesData';
import { BoardDocument } from '../types/task';

interface StartHomeScreenProps {
  onOpenWorkspace: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const StartHomeScreen: React.FC<StartHomeScreenProps> = ({
  onOpenWorkspace,
  onOpenSettings,
  onOpenAuth
}) => {
  const { 
    boards, 
    activeBoardId, 
    setActiveBoardId, 
    allTasks, 
    projects, 
    user, 
    applyTemplate,
    deleteBoard,
    exportBoardToFile,
    importBoardFromFile,
    createBoard,
    syncStatus
  } = useTaskContext();

  const { effectiveTheme, isLiquidGlass, setThemeMode, preferences } = useSettings();
  const isLight = effectiveTheme === 'light';

  // Navigation tab like Word Start Screen (Accueil, Nouveau / Modèles, Ouvrir)
  const [activeNav, setActiveNav] = useState<'home' | 'templates' | 'open'>('home');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [searchDocQuery, setSearchDocQuery] = useState('');

  // Recent documents view mode: 'categories' (Gros Documents / Presets) vs 'boards' (Documents individuels)
  const [recentViewMode, setRecentViewMode] = useState<'categories' | 'boards'>(() => {
    try {
      return (localStorage.getItem('taskflow_start_view_mode') as 'categories' | 'boards') || 'categories';
    } catch {}
    return 'categories';
  });

  const handleSetRecentViewMode = (mode: 'categories' | 'boards') => {
    setRecentViewMode(mode);
    try {
      localStorage.setItem('taskflow_start_view_mode', mode);
    } catch {}
  };

  // Electron Window Controls (Minimize, Maximize / Restore, Close)
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if ((window as any).electronAPI?.isMaximized) {
      (window as any).electronAPI.isMaximized().then((max: boolean) => {
        setIsMaximized(max);
      }).catch(() => {});
    }
  }, []);

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
        setIsMaximized(prev => !prev);
      }
    } else {
      setIsMaximized(prev => !prev);
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI?.closeWindow) {
      (window as any).electronAPI.closeWindow();
    }
  };

  // State for Saving Category / Workspace as a Preset (Gros Document)
  const [isSavingCategoryPresetModalOpen, setIsSavingCategoryPresetModalOpen] = useState(false);
  const [targetCategoryForPreset, setTargetCategoryForPreset] = useState<string>('__ALL__');
  const [presetTitle, setPresetTitle] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetBadge, setPresetBadge] = useState('Gros Document Unifié');
  const [presetColor, setPresetColor] = useState('#007AFF');
  const [presetToastMessage, setPresetToastMessage] = useState<string | null>(null);

  // Master Document title (unified multi-category document)
  const [masterDocTitle, setMasterDocTitle] = useState(() => {
    try {
      return localStorage.getItem('taskflow_master_doc_title') || 'Document Principal TaskFlow';
    } catch {}
    return 'Document Principal TaskFlow';
  });
  const [isEditingMasterDocTitle, setIsEditingMasterDocTitle] = useState(false);
  const [tempMasterDocTitle, setTempMasterDocTitle] = useState(masterDocTitle);

  const handleSaveMasterDocTitle = () => {
    if (!tempMasterDocTitle.trim()) return;
    setMasterDocTitle(tempMasterDocTitle.trim());
    try {
      localStorage.setItem('taskflow_master_doc_title', tempMasterDocTitle.trim());
    } catch {}
    setIsEditingMasterDocTitle(false);
  };
  
  // Custom template creation modal state
  const [isCreatingCustomTemplate, setIsCreatingCustomTemplate] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customColor, setCustomColor] = useState('#007AFF');
  const [customProjectName, setCustomProjectName] = useState('Nouveau Projet');

  // Custom user templates saved in localStorage
  const [customTemplates, setCustomTemplates] = useState<TaskFlowTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('taskflow_custom_user_templates_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const allTemplates = useMemo(() => {
    return [...customTemplates, ...TEMPLATES_CATALOG];
  }, [customTemplates]);

  const filteredTemplates = useMemo(() => {
    if (templateCategoryFilter === 'all') return allTemplates;
    if (templateCategoryFilter === 'custom') return allTemplates.filter(t => t.isCustom);
    if (templateCategoryFilter === 'preset') return allTemplates.filter(t => t.isPresetGroup || t.category === 'preset');
    return allTemplates.filter(t => t.category === templateCategoryFilter);
  }, [allTemplates, templateCategoryFilter]);

  const filteredBoards = useMemo(() => {
    if (!searchDocQuery.trim()) return boards;
    const q = searchDocQuery.toLowerCase();
    return boards.filter(b => 
      b.title.toLowerCase().includes(q) || 
      (b.projectName && b.projectName.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
    );
  }, [boards, searchDocQuery]);

  // Unique categories / Gros Documents groups
  const categoryGroups = useMemo(() => {
    const allCatNames = Array.from(new Set([
      ...projects,
      ...boards.map(b => b.projectName || 'Non classé')
    ])).filter(Boolean);

    const q = searchDocQuery.toLowerCase().trim();

    return allCatNames.map(catName => {
      const catBoards = boards.filter(b => (b.projectName || 'Non classé') === catName);
      const catTasks = allTasks.filter(t => catBoards.some(b => b.id === t.boardId));
      const doneCount = catTasks.filter(t => t.status === 'done').length;
      const inProgressCount = catTasks.filter(t => t.status === 'in_progress').length;
      const todoCount = catTasks.filter(t => t.status === 'todo').length;
      const hasActive = catBoards.some(b => b.id === activeBoardId);

      const matchesSearch = !q || 
        catName.toLowerCase().includes(q) || 
        catBoards.some(b => b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q)));

      return {
        categoryName: catName,
        boards: catBoards,
        tasks: catTasks,
        totalTasks: catTasks.length,
        doneCount,
        inProgressCount,
        todoCount,
        hasActive,
        matchesSearch
      };
    }).filter(group => group.boards.length > 0 && group.matchesSearch);
  }, [boards, projects, allTasks, activeBoardId, searchDocQuery]);

  const activeBoard = useMemo(() => {
    return boards.find(b => b.id === activeBoardId) || boards[0];
  }, [boards, activeBoardId]);

  const handleLaunchTemplate = async (tmpl: TaskFlowTemplate) => {
    await applyTemplate(tmpl);
    onOpenWorkspace();
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    onOpenWorkspace();
  };

  const handleSaveCustomTemplate = () => {
    if (!customTitle.trim()) return;

    const newCustomTemplate: TaskFlowTemplate = {
      id: `custom-template-${Date.now()}`,
      title: customTitle.trim(),
      subtitle: 'Modèle personnalisé créé par vous',
      category: 'personal',
      badge: 'Personnalisé',
      description: customDescription.trim() || 'Modèle de projet configuré sur mesure.',
      icon: 'star',
      color: customColor,
      isCustom: true,
      boards: [
        {
          title: customTitle.trim(),
          description: customDescription.trim() || 'Tableau basé sur votre modèle',
          icon: 'folder',
          color: customColor,
          projectName: customProjectName.trim() || 'Projets Personnalisés',
          order: 0,
        }
      ],
      tasks: [],
    };

    const updated = [newCustomTemplate, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('taskflow_custom_user_templates_v1', JSON.stringify(updated));
    } catch {}

    setIsCreatingCustomTemplate(false);
    setCustomTitle('');
    setCustomDescription('');
    handleLaunchTemplate(newCustomTemplate);
  };

  const handleOpenCategoryGroup = (groupBoards: BoardDocument[]) => {
    if (!groupBoards.length) return;
    const activeInGroup = groupBoards.find(b => b.id === activeBoardId);
    setActiveBoardId(activeInGroup ? activeInGroup.id : groupBoards[0].id);
    onOpenWorkspace();
  };

  const openSaveCategoryPresetModal = (catName: string = '__ALL__') => {
    setTargetCategoryForPreset(catName);
    
    const categoryNamesList = categoryGroups.map(g => g.categoryName).join(', ');
    if (catName === '__ALL__') {
      setPresetTitle(`Preset ${masterDocTitle}`);
      setPresetDescription(`Gros Document unifié regroupant toutes vos catégories (${categoryNamesList}), ${boards.length} projets et ${allTasks.length} tâches.`);
    } else {
      const catBoards = boards.filter(b => (b.projectName || 'Non classé') === catName);
      const catTasks = allTasks.filter(t => catBoards.some(b => b.id === t.boardId));
      setPresetTitle(`Preset ${catName}`);
      setPresetDescription(`Gros Document contenant ${catBoards.length} projet${catBoards.length > 1 ? 's' : ''} (${catBoards.map(b => b.title).join(', ')}) et ${catTasks.length} tâches.`);
    }
    setPresetBadge('Gros Document Unifié');
    setPresetColor('#007AFF');
    setIsSavingCategoryPresetModalOpen(true);
  };

  const handleTargetCategoryChange = (newCat: string) => {
    setTargetCategoryForPreset(newCat);
    const categoryNamesList = categoryGroups.map(g => g.categoryName).join(', ');
    if (newCat === '__ALL__') {
      setPresetTitle(`Preset ${masterDocTitle}`);
      setPresetDescription(`Gros Document unifié regroupant toutes vos catégories (${categoryNamesList}), ${boards.length} projets et ${allTasks.length} tâches.`);
    } else {
      const catBoards = boards.filter(b => (b.projectName || 'Non classé') === newCat);
      const catTasks = allTasks.filter(t => catBoards.some(b => b.id === t.boardId));
      setPresetTitle(`Preset ${newCat}`);
      setPresetDescription(`Gros Document contenant ${catBoards.length} projet${catBoards.length > 1 ? 's' : ''} (${catBoards.map(b => b.title).join(', ')}) et ${catTasks.length} tâches.`);
    }
  };

  const handleConfirmSavePreset = () => {
    if (!presetTitle.trim()) return;

    const catBoards = targetCategoryForPreset === '__ALL__'
      ? boards
      : boards.filter(b => (b.projectName || 'Non classé') === targetCategoryForPreset);

    if (catBoards.length === 0) return;

    const catTasks = allTasks.filter(t => catBoards.some(b => b.id === t.boardId));

    const newPresetTemplate: TaskFlowTemplate = {
      id: `preset-group-${Date.now()}`,
      title: presetTitle.trim(),
      subtitle: `Gros Document (${catBoards.length} projet${catBoards.length > 1 ? 's' : ''}, ${catTasks.length} tâches)`,
      category: 'preset',
      badge: presetBadge.trim() || 'Gros Document',
      description: presetDescription.trim() || `Preset multi-projets basé sur la catégorie ${targetCategoryForPreset}.`,
      icon: 'layers',
      color: presetColor,
      isCustom: true,
      isPresetGroup: true,
      categoryName: targetCategoryForPreset === '__ALL__' ? 'Espace Complet' : targetCategoryForPreset,
      createdAt: new Date().toISOString(),
      boards: catBoards.map((b, idx) => ({
        title: b.title,
        description: b.description || '',
        icon: b.icon || 'folder',
        color: b.color || presetColor,
        projectName: b.projectName || presetTitle,
        order: idx,
        originalBoardId: b.id,
      })),
      tasks: catTasks.map(t => {
        const bIdx = catBoards.findIndex(b => b.id === t.boardId);
        return {
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          category: t.category,
          tags: t.tags,
          subtasks: t.subtasks,
          screenshotUrl: t.screenshotUrl,
          order: t.order,
          boardIndex: bIdx >= 0 ? bIdx : 0,
          originalBoardId: t.boardId,
        };
      }),
    };

    const updated = [newPresetTemplate, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('taskflow_custom_user_templates_v1', JSON.stringify(updated));
    } catch {}

    setIsSavingCategoryPresetModalOpen(false);
    setPresetToastMessage(`Le Gros Document "${newPresetTemplate.title}" a été enregistré comme Preset !`);
    setTimeout(() => setPresetToastMessage(null), 5000);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce preset / modèle enregistré ?")) {
      const updated = customTemplates.filter(t => t.id !== id);
      setCustomTemplates(updated);
      try {
        localStorage.setItem('taskflow_custom_user_templates_v1', JSON.stringify(updated));
      } catch {}
    }
  };

  const getTemplateIcon = (iconName: string, color: string) => {
    const props = { className: 'w-6 h-6', style: { color } };
    switch (iconName) {
      case 'layers': return <Layers {...props} />;
      case 'plus': return <Plus {...props} />;
      case 'code': return <Code {...props} />;
      case 'rocket': return <Rocket {...props} />;
      case 'sparkles': return <Sparkles {...props} />;
      case 'briefcase': return <Briefcase {...props} />;
      case 'home': return <Home {...props} />;
      case 'star': return <Star {...props} />;
      default: return <FileText {...props} />;
    }
  };

  const cycleTheme = () => {
    if (preferences.themeMode === 'system') {
      setThemeMode('light');
    } else if (preferences.themeMode === 'light') {
      setThemeMode('dark');
    } else if (preferences.themeMode === 'dark') {
      setThemeMode('liquid-glass');
    } else {
      setThemeMode('system');
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none transition-colors ${
      isLiquidGlass
        ? 'bg-[#050814] text-[#f5f5f7]'
        : isLight 
        ? 'bg-[#f4f5f7] text-slate-800' 
        : 'bg-[#121316] text-[#e3e3e3]'
    }`}>
      {/* Windows 11 Native Titlebar with Drag & Window Controls (Réduire, Agrandir, Fermer) */}
      <div 
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onDoubleClick={handleMaximize}
        className={`h-9 w-full flex items-center justify-between px-3 border-b select-none shrink-0 z-50 backdrop-blur-md transition-colors ${
          isLiquidGlass
            ? 'bg-[#090d1c]/80 border-white/10 text-slate-300'
            : isLight
            ? 'bg-slate-100/90 border-slate-200 text-slate-700'
            : 'bg-[#18191c]/95 border-white/10 text-slate-300'
        }`}
      >
        <div className="flex items-center space-x-2 text-xs font-semibold pointer-events-none">
          <TaskFlowLogo size={18} showText={false} />
          <span className="text-[11px] font-medium tracking-tight">TaskFlow Windows</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF] font-mono font-bold">
            v1.5.0
          </span>
        </div>

        {/* Center Draggable Area */}
        <div className="flex-1 h-full cursor-default" />

        {/* Windows Native Controls: Réduire, Agrandir / Restaurer, Fermer */}
        <div 
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className="flex items-center h-full -mr-3"
        >
          <button
            onClick={handleMinimize}
            className={`h-9 w-11 flex items-center justify-center transition-colors cursor-pointer ${
              isLight ? 'hover:bg-black/10 text-slate-700' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Réduire"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className={`h-9 w-11 flex items-center justify-center transition-colors cursor-pointer ${
              isLight ? 'hover:bg-black/10 text-slate-700' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title={isMaximized ? "Restaurer" : "Agrandir"}
          >
            {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={handleClose}
            className="h-9 w-11 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#EA4335] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body Container (Sidebar + Main) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* 1. Left Navigation Rail (Word / Office Start Screen Style) */}
        <aside className={`w-full md:w-64 lg:w-72 shrink-0 border-r flex flex-col justify-between p-4 md:p-5 z-20 backdrop-blur-2xl transition-all ${
          isLiquidGlass
            ? 'bg-[#090d1c]/80 border-white/15 text-slate-200 shadow-2xl'
            : isLight 
            ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm' 
            : 'bg-[#18191c]/90 border-white/10 text-slate-200'
        }`}>
          {/* Brand Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center space-x-2.5">
                <TaskFlowLogo size={32} showText={true} />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF] font-mono font-bold">
                  v1.5.0
                </span>
              </div>
            </div>

          {/* Primary Hub Navigation Tabs */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveNav('home')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeNav === 'home'
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25 font-bold'
                  : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => setActiveNav('templates')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeNav === 'templates'
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25 font-bold'
                  : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Nouveau & Modèles</span>
            </button>

            <button
              onClick={() => setActiveNav('open')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeNav === 'open'
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25 font-bold'
                  : isLight 
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Ouvrir un document</span>
            </button>

            {/* Save Preset action */}
            <button
              onClick={() => openSaveCategoryPresetModal()}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                isLiquidGlass
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/30 text-amber-200'
                  : isLight
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300'
              }`}
              title="Enregistrer une catégorie avec ses sous-projets comme Preset réutilisable"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/40 shrink-0" />
              <span className="truncate">Enregistrer un Preset</span>
            </button>
          </nav>

          {/* Quick Resume Active Workspace Button */}
          {activeBoard && (
            <div className={`p-3 rounded-2xl border transition-all ${
              isLiquidGlass
                ? 'bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border-cyan-400/30'
                : isLight
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-medium">
                <span>Document en cours</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeBoard.color || '#007AFF' }} />
              </div>
              <p className={`font-semibold text-xs truncate mb-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {activeBoard.title}
              </p>
              <button
                onClick={onOpenWorkspace}
                className="w-full py-2 px-3 rounded-xl bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-[#007AFF]/25 apple-btn-active cursor-pointer transition-all"
              >
                <span>Accéder au document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer: User Profile, Theme & Settings */}
        <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
          {/* User Status */}
          <div 
            onClick={onOpenAuth}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2.5 truncate">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs">
                  {user?.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="truncate">
                <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {user ? user.displayName || user.email?.split('@')[0] : 'Mode Local'}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{user ? 'Cloud Connecté' : 'Non connecté'}</span>
                </p>
              </div>
            </div>
            <Cloud className={`w-4 h-4 ${user ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={cycleTheme}
              className={`p-2 rounded-xl border flex-1 flex items-center justify-center space-x-1.5 text-xs font-medium transition-colors cursor-pointer ${
                isLiquidGlass
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                  : isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Changer de thème d'affichage"
            >
              {isLiquidGlass ? (
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              ) : isLight ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span className="text-[11px] truncate">
                {isLiquidGlass ? 'Liquid Glass' : isLight ? 'Clair' : 'Sombre'}
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Paramètres de l'application"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Hub Workspace (Header, Template Gallery, Recent Docs) */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto min-w-0 p-5 md:p-8 space-y-7 relative">
        {/* Specular Ambient Light Background for Liquid Glass */}
        {isLiquidGlass && (
          <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-tr from-[#007AFF]/15 via-cyan-500/10 to-[#AF52DE]/10 blur-[100px] pointer-events-none rounded-full" />
        )}

        {/* TAB: ACCUEIL */}
        {activeNav === 'home' && (
          <div className="space-y-8 relative z-10">
            {/* Header / Welcome greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Page d'accueil
                </h1>
                <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Démarrez un nouveau tableau, chargez un modèle ou reprenez vos projets récents.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openSaveCategoryPresetModal()}
                  className={`px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isLiquidGlass
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/25'
                      : isLight
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                  }`}
                  title="Enregistrer une catégorie avec ses sous-projets comme Preset réutilisable"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
                  <span>Enregistrer une catégorie en Preset</span>
                </button>

                <button
                  onClick={() => setIsCreatingCustomTemplate(true)}
                  className={`px-3.5 py-2 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isLiquidGlass
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/25'
                      : isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Créer un nouveau modèle</span>
                </button>
              </div>
            </div>

            {/* Section: Modèles prêts à l'emploi (Word-style top row cards) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className={`text-sm font-bold tracking-tight uppercase text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Nouveau & Modèles
                </h2>
                <button 
                  onClick={() => setActiveNav('templates')}
                  className="text-xs text-[#007AFF] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Tous les modèles ({allTemplates.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Blank Board Card */}
                <div 
                  onClick={() => handleLaunchTemplate(TEMPLATES_CATALOG[1])}
                  className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden ${
                    isLiquidGlass
                      ? 'apple-liquid-card hover:border-[#34C759]/60 hover:shadow-lg'
                      : isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm' 
                      : 'bg-[#1c1d22] hover:bg-[#23242b] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-[#34C759]/15 border border-[#34C759]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-[#34C759] stroke-[2.5]" />
                    </div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#34C759]/20 text-[#34C759]">
                        Vierge
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Tableau Vierge
                    </h3>
                    <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Démarrez un document vierge avec vos 3 colonnes fluides.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-[#34C759]">
                    <span>Créer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Registered Standard Workspace Model (Existing Grouping) */}
                <div 
                  onClick={() => handleLaunchTemplate(TEMPLATES_CATALOG[0])}
                  className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden ${
                    isLiquidGlass
                      ? 'apple-liquid-card border-cyan-400/40 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-[#12182b]/50 shadow-xl'
                      : isLight 
                      ? 'bg-white hover:bg-slate-50 border-[#007AFF]/40 shadow-md ring-1 ring-[#007AFF]/20' 
                      : 'bg-[#1c1d22] hover:bg-[#23242b] border-[#007AFF]/40 ring-1 ring-[#007AFF]/20'
                  }`}
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-[#007AFF]/15 border border-[#007AFF]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6 text-[#007AFF]" />
                    </div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF]">
                        Modèle Enregistré
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Modèle Standard TaskFlow
                    </h3>
                    <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Votre espace enregistré actuel (3 projets : Sprints, Design UI, Personnel).
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-[#007AFF]">
                    <span>Ouvrir l'espace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Agile Sprint Template */}
                <div 
                  onClick={() => handleLaunchTemplate(TEMPLATES_CATALOG[2])}
                  className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.99] ${
                    isLiquidGlass
                      ? 'apple-liquid-card hover:border-[#007AFF]/50'
                      : isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm' 
                      : 'bg-[#1c1d22] hover:bg-[#23242b] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-[#007AFF]/15 border border-[#007AFF]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Code className="w-6 h-6 text-[#007AFF]" />
                    </div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Technique
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Agile & Sprints
                    </h3>
                    <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Idéal pour planifier les tâches de dev, bugs et cycles de livraison.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-[#007AFF]">
                    <span>Charger</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 4. Custom Preset Card (if any) or Marketing Campaigns Template */}
                {customTemplates.length > 0 ? (
                  <div 
                    onClick={() => handleLaunchTemplate(customTemplates[0])}
                    className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden ${
                      isLiquidGlass
                        ? 'apple-liquid-card border-amber-400/40 bg-gradient-to-br from-amber-950/30 to-[#12182b]/50 shadow-lg'
                        : isLight 
                        ? 'bg-amber-50/70 hover:bg-amber-50 border-amber-300 shadow-sm' 
                        : 'bg-[#201d18] hover:bg-[#28231c] border-amber-500/30'
                    }`}
                  >
                    <div>
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400/40" />
                      </div>
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          {customTemplates[0].badge || 'Votre Preset'}
                        </span>
                      </div>
                      <h3 className={`font-bold text-sm tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {customTemplates[0].title}
                      </h3>
                      <p className={`text-[11px] mt-1 leading-snug line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {customTemplates[0].subtitle || customTemplates[0].description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span>Charger ce Preset</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleLaunchTemplate(TEMPLATES_CATALOG[4])}
                    className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] active:scale-[0.99] ${
                      isLiquidGlass
                        ? 'apple-liquid-card hover:border-[#FF9500]/50'
                        : isLight 
                        ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm' 
                        : 'bg-[#1c1d22] hover:bg-[#23242b] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="w-11 h-11 rounded-2xl bg-[#FF9500]/15 border border-[#FF9500]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-[#FF9500]" />
                      </div>
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                          Marketing
                        </span>
                      </div>
                      <h3 className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Campagnes & Contenus
                      </h3>
                      <p className={`text-[11px] mt-1 leading-snug ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Planning éditorial, création visuelle et calendrier réseaux.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-[#FF9500]">
                      <span>Charger</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Documents & Gros Documents récents (Word-style lower section) */}
            <div className="space-y-4 pt-4">
              {/* Toast message if preset saved */}
              {presetToastMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{presetToastMessage}</span>
                  </div>
                  <button onClick={() => setPresetToastMessage(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-2 mr-2">
                    <Clock className="w-4 h-4 text-[#007AFF]" />
                    <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {recentViewMode === 'categories' 
                        ? 'Gros Document Unifié (Toutes les catégories réunies)' 
                        : `Projets individuels (${filteredBoards.length})`}
                    </h2>
                  </div>

                  {/* Mode Selector Toggle: Gros Document Unifié vs Projets Individuels */}
                  <div className={`flex items-center p-0.5 rounded-full border ${
                    isLight ? 'bg-slate-100 border-slate-300' : 'bg-black/30 border-white/10'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleSetRecentViewMode('categories')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        recentViewMode === 'categories'
                          ? 'bg-[#007AFF] text-white shadow-xs font-bold'
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Regrouper toutes les catégories et projets dans un seul gros document unifié"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Gros Document Unifié</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetRecentViewMode('boards')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        recentViewMode === 'boards'
                          ? 'bg-[#007AFF] text-white shadow-xs font-bold'
                          : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Afficher chaque projet individuellement"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Projets individuels ({filteredBoards.length})</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Quick button to save as preset */}
                  <button
                    onClick={() => openSaveCategoryPresetModal('__ALL__')}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                      isLiquidGlass
                        ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/25'
                        : isLight
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                    }`}
                    title="Enregistrer ce document complet avec toutes ses catégories comme Preset"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
                    <span>Enregistrer en tant que Preset</span>
                  </button>

                  {/* Search bar inside Recents */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchDocQuery}
                      onChange={(e) => setSearchDocQuery(e.target.value)}
                      placeholder="Filtrer les projets..."
                      className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-full border focus:outline-none transition-all ${
                        isLight 
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-[#007AFF]' 
                          : 'bg-black/30 border-white/10 text-white focus:border-[#007AFF]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* View 1: UN SEUL GROS DOCUMENT UNIFIÉ REGROUPANT TOUTES LES CATÉGORIES */}
              {recentViewMode === 'categories' ? (
                <div className="space-y-5">
                  {categoryGroups.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Aucun document ni projet trouvé.
                    </div>
                  ) : (
                    <>
                      {/* LE GROS DOCUMENT UNIQUE CONTENANT TOUTES LES CATÉGORIES */}
                      <div
                        className={`p-5 md:p-6 rounded-3xl border transition-all duration-200 space-y-5 group ${
                          isLiquidGlass
                            ? 'apple-liquid-card border-cyan-400/40 bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-[#12182b]/50 shadow-xl'
                            : isLight 
                            ? 'bg-white hover:bg-slate-50 border-[#007AFF]/40 shadow-md ring-1 ring-[#007AFF]/20' 
                            : 'bg-[#18191d] hover:bg-[#1e1f26] border-[#007AFF]/40 ring-1 ring-[#007AFF]/20 shadow-md'
                        }`}
                      >
                        {/* Header du Gros Document Unifié */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#007AFF] to-[#00C6FF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/30 shrink-0">
                              <Layers className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                {isEditingMasterDocTitle ? (
                                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={tempMasterDocTitle}
                                      onChange={(e) => setTempMasterDocTitle(e.target.value)}
                                      className={`text-base sm:text-lg font-bold border rounded-lg px-2.5 py-1 outline-none ${
                                        isLight ? 'bg-white border-blue-500 text-slate-900' : 'bg-black border-blue-500 text-white'
                                      }`}
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSaveMasterDocTitle}
                                      className="p-1.5 bg-[#007AFF] text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <h3 className={`font-bold text-base sm:text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                      {masterDocTitle}
                                    </h3>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTempMasterDocTitle(masterDocTitle);
                                        setIsEditingMasterDocTitle(true);
                                      }}
                                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                      title="Renommer ce document"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30">
                                  Gros Document Unifié
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  {categoryGroups.length} catégories réunies &bull; {filteredBoards.length} projets
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {allTasks.length} tâches au total &bull; {allTasks.filter(t => t.status === 'done').length} terminées &bull; {allTasks.filter(t => t.status === 'in_progress').length} en cours &bull; {allTasks.filter(t => t.status === 'todo').length} à faire
                              </p>
                            </div>
                          </div>

                          {/* Actions principales sur le Gros Document */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => openSaveCategoryPresetModal('__ALL__')}
                              className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                                isLiquidGlass
                                  ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/40 text-amber-200'
                                  : isLight
                                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                              }`}
                              title="Enregistrer ce document complet avec toutes ses catégories comme Preset réutilisable"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
                              <span>Enregistrer en tant que Preset</span>
                            </button>

                            <button
                              onClick={onOpenWorkspace}
                              className="px-5 py-2 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-[#007AFF]/25 transition-all cursor-pointer"
                            >
                              <span>Ouvrir ce Gros Document</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Barre de progression globale */}
                        {allTasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-[#007AFF] via-[#34C759] to-[#00C6FF] h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.round((allTasks.filter(t => t.status === 'done').length / allTasks.length) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* TOUTES LES CATÉGORIES REGROUPÉES DANS CE MÊME DOCUMENT */}
                        <div className="space-y-3 pt-2">
                          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                            Catégories & Projets groupés dans ce Document ({categoryGroups.length} catégories, {filteredBoards.length} projets) :
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryGroups.map((group) => {
                              const catPercent = group.totalTasks > 0 ? Math.round((group.doneCount / group.totalTasks) * 100) : 0;

                              return (
                                <div
                                  key={group.categoryName}
                                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                                    isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-black/30 border-white/10'
                                  }`}
                                >
                                  {/* Sous-en-tête de catégorie */}
                                  <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                                    <div className="flex items-center space-x-2 font-bold text-xs truncate">
                                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                                      <span className="truncate">{group.categoryName}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">({group.boards.length})</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {group.doneCount}/{group.totalTasks} ({catPercent}%)
                                    </span>
                                  </div>

                                  {/* Puces de chaque projet dans cette catégorie */}
                                  <div className="space-y-1.5">
                                    {group.boards.map((b) => {
                                      const bTasks = group.tasks.filter(t => t.boardId === b.id);
                                      const bDone = bTasks.filter(t => t.status === 'done').length;
                                      const isCurrent = b.id === activeBoardId;

                                      return (
                                        <button
                                          key={b.id}
                                          type="button"
                                          onClick={() => handleSelectBoard(b.id)}
                                          className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer group/chip ${
                                            isCurrent
                                              ? 'bg-[#007AFF]/20 border-[#007AFF]/60 text-[#007AFF] font-bold shadow-xs'
                                              : isLight
                                              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                                              : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-200'
                                          }`}
                                          title={`Ouvrir le projet ${b.title}`}
                                        >
                                          <div className="flex items-center space-x-2 truncate">
                                            <span 
                                              className="w-2 h-2 rounded-full shrink-0 group-hover/chip:scale-125 transition-transform" 
                                              style={{ backgroundColor: b.color || '#007AFF' }} 
                                            />
                                            <span className="font-semibold truncate">{b.title}</span>
                                          </div>
                                          <div className="flex items-center space-x-1.5 shrink-0 text-[10px] opacity-60">
                                            <span>{bTasks.length} tâche{bTasks.length > 1 ? 's' : ''} ({bDone} faite{bDone > 1 ? 's' : ''})</span>
                                            <ArrowRight className="w-3 h-3 group-hover/chip:translate-x-0.5 transition-all text-[#007AFF]" />
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* AUTRES PRESETS & GROS DOCUMENTS ENREGISTRÉS PAR L'UTILISATEUR (SI EXISTANTS) */}
                      {customTemplates.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            Vos Autres Presets Enregistrés ({customTemplates.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {customTemplates.map((preset) => (
                              <div
                                key={preset.id}
                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                  isLight ? 'bg-white border-slate-200' : 'bg-[#18191d] border-white/10'
                                }`}
                              >
                                <div className="flex items-center space-x-3 truncate">
                                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                                    <Star className="w-4 h-4 fill-amber-400/30" />
                                  </div>
                                  <div className="truncate">
                                    <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                      {preset.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                      {preset.subtitle} &bull; {preset.boards.length} projet{preset.boards.length > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1.5 shrink-0">
                                  <button
                                    onClick={(e) => handleDeleteCustomTemplate(preset.id, e)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                    title="Supprimer ce preset"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleLaunchTemplate(preset)}
                                    className="px-3 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
                                  >
                                    <span>Charger</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* View 2: Documents individuels */
                <div className="space-y-2">
                  {filteredBoards.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Aucun document ne correspond à votre recherche.
                    </div>
                  ) : (
                    filteredBoards.map((doc) => {
                      const docTasks = allTasks.filter(t => t.boardId === doc.id);
                      const doneCount = docTasks.filter(t => t.status === 'done').length;
                      const isActive = doc.id === activeBoardId;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleSelectBoard(doc.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group hover:scale-[1.005] ${
                            isActive
                              ? 'border-[#007AFF]/60 bg-[#007AFF]/10 shadow-sm'
                              : isLight 
                              ? 'bg-white hover:bg-slate-50 border-slate-200' 
                              : 'bg-[#18191d] hover:bg-[#202127] border-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5 truncate">
                            <span 
                              className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                              style={{ backgroundColor: doc.color || '#007AFF' }} 
                            />
                            <div className="truncate">
                              <div className="flex items-center space-x-2">
                                <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {doc.title}
                                </h4>
                                {isActive && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#007AFF]/20 text-[#007AFF] font-bold">
                                    Actif
                                  </span>
                                )}
                                {doc.projectName && (
                                  <span className={`text-[9px] px-2 py-0.2 rounded-full border ${
                                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'
                                  }`}>
                                    {doc.projectName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {docTasks.length} tâche{docTasks.length > 1 ? 's' : ''} ({doneCount} terminée{doneCount > 1 ? 's' : ''})
                                {doc.description && ` • ${doc.description}`}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportBoardToFile(doc.id);
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-600' : 'hover:bg-white/10 border-white/10 text-slate-400'
                              }`}
                              title="Exporter en fichier .taskflow"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleSelectBoard(doc.id)}
                              className="px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-all"
                            >
                              <span>Ouvrir</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: TOUS LES MODÈLES */}
        {activeNav === 'templates' && (
          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Galerie de Modèles Prêts à l'Emploi
                </h1>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Sélectionnez un modèle développé par TaskFlow ou créez votre propre modèle.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openSaveCategoryPresetModal()}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center space-x-2 shadow-sm cursor-pointer transition-all ${
                    isLiquidGlass
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 hover:bg-amber-500/25'
                      : isLight
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                  }`}
                  title="Enregistrer une catégorie avec ses sous-projets comme Preset réutilisable"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400/40" />
                  <span>Enregistrer une catégorie en Preset</span>
                </button>

                <button
                  onClick={() => setIsCreatingCustomTemplate(true)}
                  className="px-4 py-2 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer un nouveau modèle</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Tous les modèles' },
                { id: 'preset', label: '⭐ Presets & Gros Documents' },
                { id: 'registered', label: '⭐️ Modèle Enregistré' },
                { id: 'blank', label: 'Tableau Vierge' },
                { id: 'tech', label: 'Technique & Dev' },
                { id: 'business', label: 'Business & Clients' },
                { id: 'marketing', label: 'Marketing' },
                { id: 'personal', label: 'Personnel' },
                { id: 'custom', label: 'Vos modèles créés' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setTemplateCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    templateCategoryFilter === cat.id
                      ? 'bg-[#007AFF] text-white border-[#007AFF] font-bold shadow-sm'
                      : isLight 
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleLaunchTemplate(tmpl)}
                  className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:scale-[1.02] shadow-sm ${
                    tmpl.id === 'template-standard-workspace'
                      ? isLiquidGlass
                        ? 'apple-liquid-card border-cyan-400/50 shadow-xl'
                        : 'border-[#007AFF]/60 ring-1 ring-[#007AFF]/30 bg-[#007AFF]/5'
                      : isLiquidGlass
                      ? 'apple-liquid-card hover:border-white/30'
                      : isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200' 
                      : 'bg-[#1a1b20] hover:bg-[#212329] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs" style={{ backgroundColor: `${tmpl.color}20`, borderColor: `${tmpl.color}40` }}>
                        {getTemplateIcon(tmpl.icon, tmpl.color)}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {tmpl.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tmpl.color}20`, color: tmpl.color }}>
                            {tmpl.badge}
                          </span>
                        )}
                        {tmpl.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomTemplate(tmpl.id, e)}
                            className="p-1 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Supprimer ce preset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className={`font-bold text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {tmpl.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tmpl.subtitle}</p>

                    <p className={`text-xs mt-2.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {tmpl.description}
                    </p>

                    {tmpl.boards.length > 1 && (
                      <div className="mt-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] space-y-1">
                        <span className="font-semibold text-slate-400 text-[10px] uppercase block">
                          Gros Document ({tmpl.boards.length} projets inclus) :
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {tmpl.boards.map((b, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-black/10 dark:bg-white/10 font-mono text-[10px]">
                              {b.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tmpl.tasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Exemples de tâches incluses :</span>
                        <div className="space-y-0.5">
                          {tmpl.tasks.slice(0, 2).map((t, i) => (
                            <div key={i} className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              <span className="truncate">{t.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold" style={{ color: tmpl.color }}>
                    <span>Utiliser ce modèle</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: OUVRIR UN DOCUMENT */}
        {activeNav === 'open' && (
          <div className="space-y-6 relative z-10">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Ouvrir un document
              </h1>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Parcourez tous vos documents, importez un fichier local ou synchronisez vos projets d'équipe.
              </p>
            </div>

            {/* Import Area */}
            <div className={`p-6 rounded-3xl border text-center space-y-3 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#191b22] border-white/10'
            }`}>
              <div className="w-12 h-12 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Importer un fichier de document (.taskflow ou .json)
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Vous avez exporté un projet précédemment ? Vous pouvez le charger en un instant.
              </p>
              <div>
                <label className="px-5 py-2.5 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold inline-flex items-center space-x-2 transition-all cursor-pointer shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>Parcourir les fichiers</span>
                  <input
                    type="file"
                    accept=".taskflow,.json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const success = await importBoardFromFile(file);
                        if (success) onOpenWorkspace();
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Grouped by Projects */}
            <div className="space-y-4 pt-2">
              <h2 className={`text-sm font-bold tracking-tight uppercase text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Documents par dossiers de projets
              </h2>

              <div className="space-y-3">
                {projects.map((proj) => {
                  const projBoards = boards.filter(b => (b.projectName || 'Non classé') === proj);
                  if (projBoards.length === 0) return null;

                  return (
                    <div 
                      key={proj}
                      className={`p-4 rounded-2xl border space-y-2.5 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#18191d] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
                        <div className="flex items-center space-x-2 font-bold text-xs text-[#007AFF]">
                          <Folder className="w-4 h-4" />
                          <span>{proj}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({projBoards.length} document{projBoards.length > 1 ? 's' : ''})</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => openSaveCategoryPresetModal(proj)}
                            className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold border border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 flex items-center space-x-1 transition-all cursor-pointer"
                            title="Enregistrer cette catégorie comme Preset"
                          >
                            <Star className="w-3 h-3 fill-amber-400/40" />
                            <span>Preset</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCategoryGroup(projBoards)}
                            className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-[#007AFF] text-white hover:bg-[#0062cc] flex items-center space-x-1 transition-all cursor-pointer"
                          >
                            <span>Ouvrir le groupe</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {projBoards.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => handleSelectBoard(b.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              b.id === activeBoardId
                                ? 'bg-[#007AFF]/15 border-[#007AFF]/40 text-[#007AFF]'
                                : isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-black/20 hover:bg-white/5 border-white/5 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color || '#007AFF' }} />
                              <span className="text-xs font-semibold truncate">{b.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Créer un nouveau modèle personnalisé */}
        {isCreatingCustomTemplate && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
            <div className={`p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-4 ${
              isLiquidGlass
                ? 'apple-liquid-glass bg-[#111827]/95 border-white/20 text-white'
                : isLight
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#1c1d22] border-white/15 text-white'
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#007AFF]" />
                  <h3 className="font-bold text-sm">Créer un nouveau modèle</h3>
                </div>
                <button 
                  onClick={() => setIsCreatingCustomTemplate(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Nom du modèle</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ex: Refonte Site Client, Sprint IA..."
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Dossier / Projet</label>
                  <input
                    type="text"
                    value={customProjectName}
                    onChange={(e) => setCustomProjectName(e.target.value)}
                    placeholder="Ex: Projets Personnalisés"
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description (optionnelle)</label>
                  <textarea
                    rows={2}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Objectif et méthodologie de ce modèle..."
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1.5">Couleur d'accentuation</label>
                  <div className="flex gap-2">
                    {['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#00C6FF'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCustomColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${customColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomTemplate(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomTemplate}
                  disabled={!customTitle.trim()}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white cursor-pointer shadow-md"
                >
                  Enregistrer et Ouvrir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Enregistrer une catégorie comme Preset (Gros Document) */}
        {isSavingCategoryPresetModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none">
            <div className={`p-6 rounded-3xl border shadow-2xl max-w-lg w-full space-y-4 ${
              isLiquidGlass
                ? 'apple-liquid-glass bg-[#111827]/95 border-white/20 text-white'
                : isLight
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#1c1d22] border-white/15 text-white'
            }`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400/40" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Enregistrer comme Preset (Gros Document)</h3>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Conserve tous les projets et tâches de cette catégorie dans un modèle réutilisable.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSavingCategoryPresetModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <div className="space-y-3.5 text-xs">
                {/* 1. Category Selection */}
                <div>
                  <label className="block font-semibold mb-1">Catégorie / Groupe à enregistrer</label>
                  <select
                    value={targetCategoryForPreset}
                    onChange={(e) => handleTargetCategoryChange(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-medium focus:outline-none cursor-pointer ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  >
                    {categoryGroups.map(g => (
                      <option key={g.categoryName} value={g.categoryName} className="text-slate-900">
                        📁 {g.categoryName} ({g.boards.length} projet{g.boards.length > 1 ? 's' : ''}, {g.totalTasks} tâche{g.totalTasks > 1 ? 's' : ''})
                      </option>
                    ))}
                    <option value="__ALL__" className="text-slate-900">
                      🌐 Tout l'espace de travail ({boards.length} projets, {allTasks.length} tâches)
                    </option>
                  </select>
                </div>

                {/* 2. Preset Title */}
                <div>
                  <label className="block font-semibold mb-1">Nom du Preset</label>
                  <input
                    type="text"
                    value={presetTitle}
                    onChange={(e) => setPresetTitle(e.target.value)}
                    placeholder="Ex: Preset Développements..."
                    className={`w-full p-2.5 rounded-xl border focus:outline-none font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  />
                </div>

                {/* 3. Badge */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Badge personnalisé</label>
                    <input
                      type="text"
                      value={presetBadge}
                      onChange={(e) => setPresetBadge(e.target.value)}
                      placeholder="Ex: Gros Document, Dév Pro..."
                      className={`w-full p-2 rounded-xl border focus:outline-none ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1.5">Couleur d'accent</label>
                    <div className="flex gap-1.5 pt-0.5">
                      {['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#00C6FF'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setPresetColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${presetColor === c ? 'ring-2 ring-white scale-110' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Description */}
                <div>
                  <label className="block font-semibold mb-1">Description du Preset</label>
                  <textarea
                    rows={2}
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Description du contenu de ce gros document..."
                    className={`w-full p-2.5 rounded-xl border focus:outline-none leading-relaxed ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black/30 border-white/15 text-white'
                    }`}
                  />
                </div>

                {/* 5. Live Included Sub-Projects Preview */}
                <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                  isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-black/30 border-white/10'
                }`}>
                  <span className="font-bold text-[10px] uppercase text-slate-400 block tracking-wider">
                    Contenu inclus dans ce Preset :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(targetCategoryForPreset === '__ALL__' 
                      ? boards 
                      : boards.filter(b => (b.projectName || 'Non classé') === targetCategoryForPreset)
                    ).map(b => (
                      <span key={b.id} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/10 dark:bg-white/10 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color || '#007AFF' }} />
                        <span>{b.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSavingCategoryPresetModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSavePreset}
                  disabled={!presetTitle.trim()}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Enregistrer le Preset</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
);
};
