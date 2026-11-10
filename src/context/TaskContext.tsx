import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  loginWithGoogle, 
  loginWithGoogleCredential,
  loginWithEmail,
  registerWithEmail,
  logoutUser, 
  User, 
  handleFirestoreError, 
  OperationType,
  testConnection 
} from '../firebase';
import { 
  BoardDocument, 
  Task, 
  TaskStatus, 
  TaskPriority, 
  DEFAULT_CATEGORIES, 
  TagCategoryDefinition, 
  Subtask,
  TeamMember,
  TeamSession,
  BoardSortPreference 
} from '../types/task';
import { INITIAL_BOARDS, INITIAL_TASKS } from '../data/initialData';
import { TaskFlowTemplate } from '../data/templatesData';

interface TaskContextType {
  user: User | null;
  isAuthLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'local';
  lastSyncTime: Date | null;
  boards: BoardDocument[];
  sortedBoards: BoardDocument[];
  activeBoard: BoardDocument | null;
  activeBoardId: string;
  projects: string[];
  teamSessions: TeamSession[];
  boardSortPreference: BoardSortPreference;
  setBoardSortPreference: (pref: BoardSortPreference) => void;
  reorderBoards: (newBoards: BoardDocument[]) => void;
  moveBoardOrder: (boardId: string, direction: 'up' | 'down') => void;
  createProject: (projectName: string) => void;
  deleteProject: (projectName: string) => void;
  renameProject: (oldName: string, newName: string) => void;
  assignBoardToProject: (boardId: string, projectName?: string) => void;
  reorderProjects: (newProjects: string[]) => void;
  
  // Team Session actions
  createTeamSession: (name: string) => Promise<string>;
  joinTeamSession: (code: string) => Promise<boolean>;
  leaveTeamSession: (code: string) => Promise<void>;

  tasks: Task[]; // Tasks for the active board
  allTasks: Task[]; // All tasks across all boards
  categories: TagCategoryDefinition[];
  
  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;

  // Document / Workspace actions (Single Unified Document containing categories & projects)
  masterDocTitle: string;
  setMasterDocTitle: (title: string) => void;
  createNewDocument: (title?: string) => void;
  exportDocumentToFile: () => void;
  setActiveBoardId: (id: string) => void;
  createBoard: (title: string, description?: string, icon?: string, color?: string, projectName?: string, teamSessionCode?: string) => Promise<string>;
  updateBoard: (boardId: string, updates: Partial<BoardDocument>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  exportBoardToFile: (boardId: string) => void;
  importBoardFromFile: (file: File) => Promise<boolean>;
  saveCurrentDocument: () => void;
  applyTemplate: (template: TaskFlowTemplate) => Promise<string>;

  // Task actions
  createTask: (task: Omit<Task, 'id' | 'boardId' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  duplicateTask: (taskId: string) => Promise<string>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Auth actions
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleBrowser: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  notificationMessage: string | null;
  setNotificationMessage: (msg: string | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_STORAGE_BOARDS_KEY = 'taskflow_windows_boards_v1';
const LOCAL_STORAGE_TASKS_KEY = 'taskflow_windows_tasks_v1';
const LOCAL_STORAGE_ACTIVE_BOARD_KEY = 'taskflow_windows_active_board_v1';

// Strips undefined fields recursively to prevent Firestore "Unsupported field value: undefined" errors
function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      if (Array.isArray(val)) {
        cleaned[key] = val.map((item) =>
          typeof item === 'object' && item !== null && !(item instanceof Date)
            ? cleanFirestoreData(item)
            : item
        );
      } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        cleaned[key] = cleanFirestoreData(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

// Safely writes to localStorage, handling QuotaExceededError without throwing uncaught exceptions
function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error: any) {
    if (error?.name === 'QuotaExceededError' || error?.code === 22 || error?.code === 1014) {
      console.warn(`[TaskContext] LocalStorage quota exceeded for key "${key}". Data is preserved safely in app state & Firestore.`);
    } else {
      console.error(`[TaskContext] Failed to write to localStorage for key "${key}":`, error);
    }
  }
}

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('local');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Boards and tasks state
  const LOCAL_STORAGE_MASTER_DOC_TITLE_KEY = 'taskflow_master_doc_title';
  const LOCAL_STORAGE_PROJECTS_KEY = 'taskflow_windows_projects_v2';
  const LOCAL_STORAGE_BOARD_SORT_KEY = 'taskflow_windows_board_sort_v2';

  const [masterDocTitle, setMasterDocTitleState] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_MASTER_DOC_TITLE_KEY) || 'Mon Document de Travail';
    } catch {}
    return 'Mon Document de Travail';
  });

  const setMasterDocTitle = (title: string) => {
    const trimmed = title.trim() || 'Mon Document de Travail';
    setMasterDocTitleState(trimmed);
    safeLocalStorageSet(LOCAL_STORAGE_MASTER_DOC_TITLE_KEY, trimmed);
    if (user) {
      syncDocumentToFirestore(trimmed);
    }
  };

  const [boards, setBoards] = useState<BoardDocument[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_BOARDS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse local boards', e);
      }
    }
    return INITIAL_BOARDS;
  });

  const [projects, setProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // Extract unique projects from initial boards if present
    const extracted = Array.from(new Set(INITIAL_BOARDS.map((b) => b.projectName).filter(Boolean))) as string[];
    return extracted.length > 0 ? extracted : ['Projet Professionnel', 'Personnel'];
  });

  const LOCAL_STORAGE_TEAMS_KEY = 'taskflow_team_sessions_v1';

  const [teamSessions, setTeamSessions] = useState<TeamSession[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TEAMS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    safeLocalStorageSet(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(teamSessions));
  }, [teamSessions]);

  const [boardSortPreference, setBoardSortPreferenceState] = useState<BoardSortPreference>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_BOARD_SORT_KEY);
    if (saved && ['custom', 'title-asc', 'title-desc', 'date-desc', 'date-asc'].includes(saved)) {
      return saved as BoardSortPreference;
    }
    return 'custom';
  });

  useEffect(() => {
    safeLocalStorageSet(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  const setBoardSortPreference = (pref: BoardSortPreference) => {
    setBoardSortPreferenceState(pref);
    safeLocalStorageSet(LOCAL_STORAGE_BOARD_SORT_KEY, pref);
    if (user) {
      setDoc(doc(db, 'user_settings', user.uid), cleanFirestoreData({
        boardSortPreference: pref,
        updatedAt: new Date().toISOString()
      }), { merge: true }).catch((err) => {
        console.warn('Failed to sync boardSortPreference:', err);
      });
    }
  };

  const sortedBoards = useMemo(() => {
    const list = [...boards];
    switch (boardSortPreference) {
      case 'title-asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case 'date-desc':
        return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'date-asc':
        return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      case 'custom':
      default:
        return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }, [boards, boardSortPreference]);

  const reorderBoards = (newBoards: BoardDocument[]) => {
    const updated = newBoards.map((b, idx) => ({ ...b, order: idx }));
    setBoards(updated);
    if (boardSortPreference !== 'custom') {
      setBoardSortPreference('custom');
    }

    if (user) {
      updated.forEach(async (b) => {
        try {
          await setDoc(doc(db, 'boards', b.id), cleanFirestoreData({ 
            order: b.order, 
            projectName: b.projectName ?? null 
          }), { merge: true });
        } catch (e) {
          console.warn('Failed to update board order in Firestore', e);
        }
      });
    }
  };

  const moveBoardOrder = (boardId: string, direction: 'up' | 'down') => {
    const currentList = [...boards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = currentList.findIndex((b) => b.id === boardId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const temp = currentList[idx];
    currentList[idx] = currentList[targetIdx];
    currentList[targetIdx] = temp;

    const updated = currentList.map((b, i) => ({ ...b, order: i }));
    setBoards(updated);
    if (boardSortPreference !== 'custom') {
      setBoardSortPreference('custom');
    }

    if (user) {
      updated.forEach(async (b) => {
        try {
          await setDoc(doc(db, 'boards', b.id), cleanFirestoreData({ order: b.order }), { merge: true });
        } catch (e) {
          console.warn('Failed to update board order in Firestore', e);
        }
      });
    }

    showNotification(`Position du document mise à jour.`);
  };

  const persistUserSettings = async (updatedProjects: string[], updatedSort?: BoardSortPreference) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'user_settings', user.uid), cleanFirestoreData({
        projects: updatedProjects,
        boardSortPreference: updatedSort || boardSortPreference,
        updatedAt: new Date().toISOString()
      }), { merge: true });
    } catch (e) {
      console.warn('Failed to sync user_settings to Firestore:', e);
    }
  };

  const createProject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!projects.includes(trimmed)) {
      const updated = [...projects, trimmed];
      setProjects(updated);
      persistUserSettings(updated);
      if (user) {
        syncDocumentToFirestore(undefined, updated);
      }
      showNotification(`Nouveau projet créé : "${trimmed}"`);
    }
  };

  const deleteProject = (name: string) => {
    const updated = projects.filter((p) => p !== name);
    let updatedBoards: BoardDocument[] = [];
    setProjects(updated);
    setBoards((prev) => {
      updatedBoards = prev.map((b) => (b.projectName === name ? { ...b, projectName: undefined } : b));
      safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(updatedBoards));
      return updatedBoards;
    });
    persistUserSettings(updated);
    if (user) {
      syncDocumentToFirestore(undefined, updated, updatedBoards);
    }
    showNotification(`Projet "${name}" supprimé.`);
  };

  const renameProject = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const updated = projects.map((p) => (p === oldName ? trimmed : p));
    let updatedBoards: BoardDocument[] = [];
    setProjects(updated);
    setBoards((prev) => {
      updatedBoards = prev.map((b) => (b.projectName === oldName ? { ...b, projectName: trimmed } : b));
      safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(updatedBoards));
      return updatedBoards;
    });
    persistUserSettings(updated);
    if (user) {
      syncDocumentToFirestore(undefined, updated, updatedBoards);
    }
    showNotification(`Projet renommé en "${trimmed}".`);
  };

  const assignBoardToProject = (boardId: string, projectName?: string) => {
    const trimmed = projectName?.trim() || undefined;
    if (trimmed && !projects.includes(trimmed)) {
      const updated = [...projects, trimmed];
      setProjects(updated);
      persistUserSettings(updated);
    }
    updateBoard(boardId, { projectName: trimmed });
    showNotification(trimmed ? `Document rattaché à "${trimmed}"` : `Document retiré du projet.`);
  };

  const reorderProjects = (newProjects: string[]) => {
    setProjects(newProjects);
    persistUserSettings(newProjects);
    showNotification('Ordre des projets mis à jour.');
  };

  // Team Session Actions with Firestore Google Account Sync
  const createTeamSession = async (name: string): Promise<string> => {
    // Force Google Sign-In if not signed in
    let currentAuthUser = user;
    if (!currentAuthUser) {
      try {
        currentAuthUser = await loginWithGoogle();
        setUser(currentAuthUser);
      } catch (err) {
        showNotification('Connexion Google requise pour créer une session d’équipe.');
        throw err;
      }
    }

    const codeDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const code = `TF-${codeDigits}`;
    const creatorName = currentAuthUser.displayName || currentAuthUser.email?.split('@')[0] || 'Membre Google';
    const creatorId = currentAuthUser.uid;

    const newSession: TeamSession = {
      id: `team_${code}`,
      code,
      name: name.trim(),
      creatorId,
      creatorName,
      members: [
        {
          id: creatorId,
          name: creatorName,
          email: currentAuthUser.email || undefined,
          joinedAt: new Date().toISOString(),
          avatarColor: '#4285F4',
        }
      ],
      createdAt: new Date().toISOString(),
    };

    setTeamSessions((prev) => [...prev.filter(s => s.code !== code), newSession]);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'team_sessions', code), cleanFirestoreData(newSession));
    } catch (err) {
      console.warn('Firestore team_sessions write warning:', err);
    }

    // Automatically create an initial shared team document
    await createBoard(`Tableau ${name.trim()}`, `Document partagé de l'équipe ${name.trim()}`, 'briefcase', '#4285F4', name.trim(), code);

    showNotification(`Session d'équipe créée avec votre compte Google (${currentAuthUser.email}) ! Code : ${code}`);
    return code;
  };

  const joinTeamSession = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;

    // Force Google Sign-In if not signed in
    let currentAuthUser = user;
    if (!currentAuthUser) {
      try {
        currentAuthUser = await loginWithGoogle();
        setUser(currentAuthUser);
      } catch (err) {
        showNotification('Connexion Google requise pour rejoindre une équipe.');
        return false;
      }
    }

    const userName = currentAuthUser.displayName || currentAuthUser.email?.split('@')[0] || 'Membre Google';
    const userId = currentAuthUser.uid;

    // Try fetching existing session from Firestore or local state
    let existingSession = teamSessions.find((s) => s.code === cleanCode);
    try {
      const docSnap = await import('firebase/firestore').then(m => m.getDoc(doc(db, 'team_sessions', cleanCode)));
      if (docSnap.exists()) {
        existingSession = { id: docSnap.id, ...docSnap.data() } as TeamSession;
      }
    } catch (e) {
      console.warn('Firestore team_sessions read warning:', e);
    }

    const newMember: TeamMember = {
      id: userId,
      name: userName,
      email: currentAuthUser.email || undefined,
      joinedAt: new Date().toISOString(),
      avatarColor: '#34A853',
    };

    const updatedMembers = existingSession?.members ? [...existingSession.members.filter(m => m.id !== userId), newMember] : [newMember];

    const joinedSession: TeamSession = {
      id: existingSession?.id || `team_${cleanCode}`,
      code: cleanCode,
      name: existingSession?.name || `Équipe ${cleanCode}`,
      creatorId: existingSession?.creatorId || userId,
      creatorName: existingSession?.creatorName || userName,
      members: updatedMembers,
      createdAt: existingSession?.createdAt || new Date().toISOString(),
    };

    setTeamSessions((prev) => [...prev.filter(s => s.code !== cleanCode), joinedSession]);

    // Save/Update in Firestore
    try {
      await setDoc(doc(db, 'team_sessions', cleanCode), cleanFirestoreData(joinedSession), { merge: true });
    } catch (e) {
      console.warn('Firestore team_sessions update warning:', e);
    }

    // Create or select team board
    await createBoard(`Tableau Équipe ${cleanCode}`, `Tableau partagé via le code ${cleanCode}`, 'briefcase', '#4285F4', joinedSession.name, cleanCode);

    showNotification(`Vous avez rejoint l'équipe "${joinedSession.name}" (${cleanCode}) avec votre compte Google !`);
    return true;
  };

  const leaveTeamSession = async (code: string) => {
    const target = teamSessions.find((s) => s.code === code);
    setTeamSessions((prev) => prev.filter((s) => s.code !== code));

    // Remove user from Firestore team members if connected
    if (user && target) {
      try {
        const remaining = target.members.filter(m => m.id !== user.uid);
        await setDoc(doc(db, 'team_sessions', code), cleanFirestoreData({
          ...target,
          members: remaining
        }), { merge: true });
      } catch (e) {}
    }

    showNotification(target ? `Vous avez quitté l'équipe "${target.name}".` : `Session quittée.`);
  };

  const [activeBoardId, setActiveBoardIdState] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_BOARD_KEY);
    if (saved) return saved;
    return INITIAL_BOARDS[0].id;
  });

  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse local tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const showNotification = useCallback((msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Save local state to localStorage
  useEffect(() => {
    safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(allTasks));
  }, [allTasks]);

  useEffect(() => {
    safeLocalStorageSet(LOCAL_STORAGE_ACTIVE_BOARD_KEY, activeBoardId);
  }, [activeBoardId]);

  // Initial connection test
  useEffect(() => {
    testConnection();
  }, []);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        setSyncStatus('syncing');
        showNotification(`Connecté avec ${currentUser.displayName || currentUser.email}`);
      } else {
        setSyncStatus('local');
      }
    });

    return () => unsubscribe();
  }, [showNotification]);

  // Real-time listener for joined Team Sessions (Only when user is authenticated)
  useEffect(() => {
    if (!user || teamSessions.length === 0) return;

    const unsubs: (() => void)[] = [];
    teamSessions.forEach((session) => {
      if (!session.code) return;
      try {
        const sessionRef = doc(db, 'team_sessions', session.code);
        const unsub = onSnapshot(
          sessionRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              const updatedData = { id: docSnap.id, ...docSnap.data() } as TeamSession;
              setTeamSessions((prev) =>
                prev.map((s) => (s.code === updatedData.code ? updatedData : s))
              );
            }
          },
          (error) => {
            console.warn(`Snapshot permission or error on team_sessions/${session.code}:`, error.message);
          }
        );
        unsubs.push(unsub);
      } catch (e) {
        console.warn('Error subscribing to team session:', e);
      }
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user, teamSessions.map((s) => s.code).join(',')]);

  // Real-time listener for user projects & sort preferences across devices
  useEffect(() => {
    if (!user) return;

    const userSettingsRef = doc(db, 'user_settings', user.uid);
    const unsub = onSnapshot(
      userSettingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.projects)) {
            setProjects(data.projects);
          }
          if (data.boardSortPreference && ['custom', 'title-asc', 'title-desc', 'date-desc', 'date-asc'].includes(data.boardSortPreference)) {
            setBoardSortPreferenceState(data.boardSortPreference);
          }
        } else {
          // Initialize user_settings in cloud with current projects on first login
          setDoc(userSettingsRef, cleanFirestoreData({
            projects,
            boardSortPreference,
            updatedAt: new Date().toISOString()
          }), { merge: true }).catch((err) => {
            console.warn('Initial user_settings creation warning:', err);
          });
        }
      },
      (error) => {
        console.warn('user_settings sync warning:', error.message);
      }
    );

    return () => unsub();
  }, [user]);

  // Single Unified Workspace Document sync to Firestore (1 single document in user_documents/{user.uid})
  const syncDocumentToFirestore = useCallback(async (
    customTitle?: string,
    customCategories?: string[],
    customBoards?: BoardDocument[],
    customTasks?: Task[]
  ) => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'user_documents', user.uid);
      const dataToSave = cleanFirestoreData({
        id: user.uid,
        ownerId: user.uid,
        title: customTitle ?? masterDocTitle,
        categories: customCategories ?? projects,
        boards: (customBoards ?? boards).map(b => ({ ...b, ownerId: user.uid, isCloud: true })),
        tasks: (customTasks ?? allTasks).map(t => ({ ...t, ownerId: user.uid })),
        boardSortPreference,
        updatedAt: new Date().toISOString(),
        version: '1.5.2'
      });
      await setDoc(docRef, dataToSave, { merge: true });
      setSyncStatus('synced');
      setLastSyncTime(new Date());
    } catch (e: any) {
      console.warn('Error syncing unified document to Firestore:', e);
      setSyncStatus('offline');
      handleFirestoreError(e, OperationType.WRITE, 'user_documents');
    }
  }, [user, masterDocTitle, projects, boards, allTasks, boardSortPreference]);

  // Zero-loss task merging helper with strict timestamp-based conflict resolution
  const mergeTaskLists = useCallback((...arrays: (Task[] | undefined)[]): Task[] => {
    const map = new Map<string, Task>();

    const insertOrUpdate = (t: Task) => {
      if (!t || !t.id) return;
      const existing = map.get(t.id);
      if (!existing) {
        map.set(t.id, t);
      } else {
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const incomingTime = t.updatedAt ? new Date(t.updatedAt).getTime() : 0;
        if (incomingTime >= existingTime) {
          map.set(t.id, t);
        }
      }
    };

    // Always include INITIAL_TASKS as baseline if needed
    INITIAL_TASKS.forEach(insertOrUpdate);

    // Try reading local storage tasks
    try {
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (Array.isArray(parsed)) {
          parsed.forEach((t) => t && insertOrUpdate(t));
        }
      }
    } catch (e) {}

    // Add passed arrays in order
    arrays.forEach((arr) => {
      if (Array.isArray(arr)) {
        arr.forEach((t) => t && insertOrUpdate(t));
      }
    });

    return Array.from(map.values());
  }, []);

  // One-time automatic migration check to recover tasks from old Firestore subcollections
  const recoverOldFirestoreTasks = useCallback(async (userId: string, currentBoards: BoardDocument[]): Promise<Task[]> => {
    const recoveredTasks: Task[] = [];
    try {
      const { getDocs } = await import('firebase/firestore');
      for (const b of currentBoards) {
        try {
          const tasksSnap = await getDocs(collection(db, 'boards', b.id, 'tasks'));
          tasksSnap.forEach((docSnap) => {
            if (docSnap.exists()) {
              recoveredTasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
            }
          });
        } catch (e) {}
      }
    } catch (e) {}
    return recoveredTasks;
  }, []);

  // Helper to ensure every board (especially UEFN) has initial rich tasks
  const ensureBoardTasksExist = useCallback((currentBoards: BoardDocument[], currentTasks: Task[], userId?: string): Task[] => {
    const tasksMap = new Map<string, Task>(currentTasks.map(t => [t.id, t]));
    const ownerId = userId || 'local-user';

    currentBoards.forEach((b) => {
      const boardTasks = currentTasks.filter((t) => t.boardId === b.id);
      if (boardTasks.length === 0) {
        // Generate rich sample tasks for empty board based on title
        const titleLower = b.title.toLowerCase();
        if (titleLower.includes('uefn') || titleLower.includes('fortnite')) {
          const uefnSampleTasks: Task[] = [
            {
              id: `task_uefn_1_${b.id}`,
              boardId: b.id,
              ownerId,
              title: 'Level Design Island UEFN & Modélisation 3D',
              description: 'Conception de la carte Fortnite Creative avec Unreal Editor for Fortnite, import de décors Fab/Quixel et structuration des zones.',
              status: 'in_progress',
              priority: 'high',
              category: 'Développement',
              tags: ['UEFN', 'Level Design', '3D'],
              subtasks: [
                { id: `sub_u1_${b.id}`, title: 'Sculpt du terrain & placement des biomes', completed: true },
                { id: `sub_u2_${b.id}`, title: 'Import et positionnement des props Fab/Quixel', completed: true },
                { id: `sub_u3_${b.id}`, title: 'Réglage de l’éclairage Lumen et du ciel dynamique', completed: false }
              ],
              order: 0,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: `task_uefn_2_${b.id}`,
              boardId: b.id,
              ownerId,
              title: 'Programmation Verse & Logique de jeu',
              description: 'Développement des scripts Verse pour gérer la boucle de jeu, les apparitions de PNJ et la distribution des armes.',
              status: 'todo',
              priority: 'urgent',
              category: 'Développement',
              tags: ['Verse', 'Code', 'UEFN'],
              subtasks: [
                { id: `sub_u4_${b.id}`, title: 'Écriture du script Verse pour la gestion des manches', completed: false },
                { id: `sub_u5_${b.id}`, title: 'Configuration des appareils Spawner et Triggers', completed: false },
                { id: `sub_u6_${b.id}`, title: 'Tests de compilation Verse dans UEFN', completed: false }
              ],
              order: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: `task_uefn_3_${b.id}`,
              boardId: b.id,
              ownerId,
              title: 'Optimisation Mémoire & Session de test',
              description: 'Vérification du thermomètre de mémoire (100k max), optimisation des LODs et lancement d’une session de jeu multi-joueurs.',
              status: 'todo',
              priority: 'medium',
              category: 'Développement',
              tags: ['Optimisation', 'Test'],
              subtasks: [
                { id: `sub_u7_${b.id}`, title: 'Analyse des métriques de mémoire par cellule', completed: false },
                { id: `sub_u8_${b.id}`, title: 'Lancement d’un test en direct sur Fortnite', completed: false }
              ],
              order: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          uefnSampleTasks.forEach(t => tasksMap.set(t.id, t));
        } else if (titleLower.includes('youtube') || titleLower.includes('vidéo')) {
          const ytTasks: Task[] = [
            {
              id: `task_yt_1_${b.id}`,
              boardId: b.id,
              ownerId,
              title: 'Montage vidéo & Miniature accrocheuse',
              description: 'Écriture du script, enregistrement audio et montage sous Premiere Pro / DaVinci Resolve.',
              status: 'done',
              priority: 'high',
              category: 'Création',
              tags: ['YouTube', 'Montage'],
              subtasks: [
                { id: `sub_yt1_${b.id}`, title: 'Capture vidéo 4K & enregistrement de la voix', completed: true },
                { id: `sub_yt2_${b.id}`, title: 'Création de la miniature Photoshop', completed: true }
              ],
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          ytTasks.forEach(t => tasksMap.set(t.id, t));
        } else if (titleLower.includes('bts') || titleLower.includes('sio') || titleLower.includes('scolaire')) {
          const btsTasks: Task[] = [
            {
              id: `task_bts_1_${b.id}`,
              boardId: b.id,
              ownerId,
              title: 'Révisions Réseaux & Algorithmique',
              description: 'Préparation des fiches de synthèse pour les évaluations de BTS SIO.',
              status: 'in_progress',
              priority: 'high',
              category: 'Scolaire',
              tags: ['Cours', 'Examen'],
              subtasks: [
                { id: `sub_bts1_${b.id}`, title: 'Schémas d’adressage IPv4/IPv6', completed: true },
                { id: `sub_bts2_${b.id}`, title: 'Exercices d’algorithmique en Python', completed: false }
              ],
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          btsTasks.forEach(t => tasksMap.set(t.id, t));
        }
      }
    });

    return Array.from(tasksMap.values());
  }, []);

  // Firestore Sync: Listen to the 1 single unified document for this user
  useEffect(() => {
    if (!user) {
      setSyncStatus('local');
      return;
    }

    setSyncStatus('syncing');
    const userDocRef = doc(db, 'user_documents', user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.title && typeof data.title === 'string') {
            setMasterDocTitleState(data.title);
            safeLocalStorageSet(LOCAL_STORAGE_MASTER_DOC_TITLE_KEY, data.title);
          }
          if (Array.isArray(data.categories)) {
            setProjects(data.categories);
            safeLocalStorageSet(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(data.categories));
          }

          let loadedBoards: BoardDocument[] = boards;
          if (Array.isArray(data.boards) && data.boards.length > 0) {
            loadedBoards = data.boards;
            setBoards(data.boards);
            safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(data.boards));
            if (!data.boards.some((b: any) => b.id === activeBoardId)) {
              setActiveBoardIdState(data.boards[0].id);
            }
          }

          // Recover tasks from old Firestore collections if needed
          const oldRecovered = await recoverOldFirestoreTasks(user.uid, loadedBoards);

          // Merge docSnap tasks with local tasks, initial tasks, and recovered tasks
          const docTasks = Array.isArray(data.tasks) ? data.tasks : [];
          let merged = mergeTaskLists(allTasks, docTasks, oldRecovered);

          // Ensure every board has tasks populated
          merged = ensureBoardTasksExist(loadedBoards, merged, user.uid);

          setAllTasks(merged);
          safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(merged));

          if (data.boardSortPreference) {
            setBoardSortPreferenceState(data.boardSortPreference);
          }
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        } else {
          // First time cloud user or missing docSnap: Recover old Firestore tasks if any
          const oldRecovered = await recoverOldFirestoreTasks(user.uid, boards);
          let merged = mergeTaskLists(allTasks, oldRecovered);
          merged = ensureBoardTasksExist(boards, merged, user.uid);

          setAllTasks(merged);
          safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(merged));

          try {
            await setDoc(userDocRef, cleanFirestoreData({
              id: user.uid,
              ownerId: user.uid,
              title: masterDocTitle,
              categories: projects,
              boards: boards.map(b => ({ ...b, ownerId: user.uid, isCloud: true })),
              tasks: merged.map(t => ({ ...t, ownerId: user.uid })),
              boardSortPreference,
              updatedAt: new Date().toISOString(),
              version: '1.5.2'
            }));
            setSyncStatus('synced');
            setLastSyncTime(new Date());
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'user_documents');
          }
        }
      },
      (error) => {
        setSyncStatus('offline');
        handleFirestoreError(error, OperationType.GET, 'user_documents');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, mergeTaskLists, recoverOldFirestoreTasks, ensureBoardTasksExist]);

  // Debounced auto-save to the single document in Firestore
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      syncDocumentToFirestore();
    }, 1200);
    return () => clearTimeout(timer);
  }, [user, masterDocTitle, projects, boards, allTasks, boardSortPreference, syncDocumentToFirestore]);

  // Derived state
  const activeBoard = useMemo(() => {
    return boards.find((b) => b.id === activeBoardId) || boards[0] || null;
  }, [boards, activeBoardId]);

  const tasksForActiveBoard = useMemo(() => {
    return allTasks.filter((t) => t.boardId === activeBoardId);
  }, [allTasks, activeBoardId]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasksForActiveBoard.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        const matchesTag = (task.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesCategory = (task.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesCategory) return false;
      }
      // Category filter
      if (selectedCategory !== 'all') {
        if (task.category !== selectedCategory) return false;
      }
      // Tag filter
      if (selectedTag !== 'all') {
        if (!task.tags || !task.tags.includes(selectedTag)) return false;
      }
      // Priority filter
      if (selectedPriority !== 'all') {
        if (task.priority !== selectedPriority) return false;
      }
      return true;
    });
  }, [tasksForActiveBoard, searchQuery, selectedCategory, selectedTag, selectedPriority]);

  const setActiveBoardId = (id: string) => {
    setActiveBoardIdState(id);
    const targetBoard = boards.find((b) => b.id === id);
    if (targetBoard) {
      showNotification(`Document ouvert : ${targetBoard.title}`);
    }
  };

  // Document Management
  const createBoard = async (
    title: string, 
    description: string = '', 
    icon: string = 'folder', 
    color: string = '#0078d4',
    projectName?: string,
    teamSessionCode?: string
  ): Promise<string> => {
    const newId = `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBoard: BoardDocument = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      icon,
      color,
      ownerId: user ? user.uid : 'local-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCloud: !!user,
      order: boards.length,
      projectName: projectName?.trim() || undefined,
      teamSessionCode: teamSessionCode?.trim() || undefined,
    };

    let nextBoards: BoardDocument[] = [];
    setBoards((prev) => {
      nextBoards = [...prev, newBoard];
      safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(nextBoards));
      return nextBoards;
    });
    setActiveBoardIdState(newId);
    if (user && nextBoards.length > 0) {
      syncDocumentToFirestore(undefined, undefined, nextBoards);
    }
    showNotification(`Nouveau projet créé : "${title}"`);
    return newId;
  };

  const updateBoard = async (boardId: string, updates: Partial<BoardDocument>) => {
    let nextBoards: BoardDocument[] = [];
    setBoards((prev) => {
      nextBoards = prev.map((b) => (b.id === boardId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b));
      safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(nextBoards));
      return nextBoards;
    });
    if (user && nextBoards.length > 0) {
      syncDocumentToFirestore(undefined, undefined, nextBoards);
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (boards.length <= 1) {
      showNotification('Impossible de supprimer le dernier projet.');
      return;
    }

    const boardToDelete = boards.find((b) => b.id === boardId);
    let remainingBoards: BoardDocument[] = [];
    setBoards((prev) => {
      remainingBoards = prev.filter((b) => b.id !== boardId);
      safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(remainingBoards));
      return remainingBoards;
    });
    setAllTasks((prev) => prev.filter((t) => t.boardId !== boardId));

    if (user && remainingBoards.length > 0) {
      syncDocumentToFirestore(undefined, undefined, remainingBoards);
    }

    if (activeBoardId === boardId) {
      setActiveBoardIdState(remainingBoards[0].id);
    }

    showNotification(`Projet "${boardToDelete?.title || boardId}" supprimé.`);
  };

  // Export the entire Unified Document as a single .taskflow file
  const exportDocumentToFile = () => {
    const exportData = {
      app: 'TaskFlow Windows',
      version: '1.5.2',
      documentType: 'unified_document',
      exportDate: new Date().toISOString(),
      title: masterDocTitle,
      categories: projects,
      boards: boards,
      tasks: allTasks,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = masterDocTitle.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `${safeTitle}.taskflow`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Document complet "${masterDocTitle}.taskflow" téléchargé avec succès.`);
  };

  const exportBoardToFile = (_boardId?: string) => {
    exportDocumentToFile();
  };

  // Import document from .taskflow or .json file
  const importBoardFromFile = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.documentType === 'unified_document' || (Array.isArray(data.boards) && data.boards.length > 0)) {
        const importedTitle = data.title || 'Document Importé';
        const importedCategories = Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : ['Général'];
        const importedBoards = Array.isArray(data.boards) ? data.boards : [];
        const importedTasks = Array.isArray(data.tasks) ? data.tasks : [];

        setMasterDocTitle(importedTitle);
        setProjects(importedCategories);
        setBoards(importedBoards);
        if (importedBoards.length > 0) {
          setActiveBoardIdState(importedBoards[0].id);
        }
        setAllTasks(importedTasks);

        if (user) {
          syncDocumentToFirestore(importedTitle, importedCategories, importedBoards, importedTasks);
        }

        showNotification(`Document complet "${importedTitle}" importé avec ${importedCategories.length} catégories, ${importedBoards.length} projets et ${importedTasks.length} tâches.`);
        return true;
      }

      if (data.board && data.board.title) {
        const importedBoardId = `board_imported_${Date.now()}`;
        const newBoard: BoardDocument = {
          ...data.board,
          id: importedBoardId,
          title: `${data.board.title} (Importé)`,
          ownerId: user ? user.uid : 'local-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCloud: !!user,
        };

        const importedTasks: Task[] = Array.isArray(data.tasks)
          ? data.tasks.map((t: Task, idx: number) => ({
              ...t,
              id: `task_imported_${Date.now()}_${idx}`,
              boardId: importedBoardId,
              ownerId: user ? user.uid : 'local-user',
              createdAt: t.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }))
          : [];

        const updatedBoards = [...boards, newBoard];
        const updatedTasks = [...allTasks, ...importedTasks];
        setBoards(updatedBoards);
        setAllTasks(updatedTasks);
        setActiveBoardIdState(importedBoardId);

        if (user) {
          syncDocumentToFirestore(undefined, undefined, updatedBoards, updatedTasks);
        }

        showNotification(`Projet "${newBoard.title}" ajouté au document avec ${importedTasks.length} tâches.`);
        return true;
      }

      showNotification('Format de fichier invalide. Document TaskFlow attendu.');
      return false;
    } catch (e) {
      console.error('Import error', e);
      showNotification("Erreur lors de l'importation du fichier.");
      return false;
    }
  };

  const createNewDocument = (title?: string) => {
    const docTitle = title?.trim() || 'Nouveau Document';
    const initialBoardId = `board_${Date.now()}`;
    const newBoard: BoardDocument = {
      id: initialBoardId,
      title: 'Projet Principal',
      description: 'Espace de travail',
      icon: 'folder',
      color: '#007AFF',
      ownerId: user ? user.uid : 'local-user',
      projectName: 'Projets',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMasterDocTitleState(docTitle);
    safeLocalStorageSet(LOCAL_STORAGE_MASTER_DOC_TITLE_KEY, docTitle);
    setProjects(['Projets']);
    setBoards([newBoard]);
    setAllTasks([]);
    setActiveBoardIdState(initialBoardId);

    if (user) {
      syncDocumentToFirestore(docTitle, ['Projets'], [newBoard], []);
    }

    showNotification(`Nouveau document "${docTitle}" initialisé !`);
  };

  const saveCurrentDocument = async () => {
    try {
      safeLocalStorageSet(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(boards));
      safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(allTasks));
      safeLocalStorageSet(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
      safeLocalStorageSet(LOCAL_STORAGE_MASTER_DOC_TITLE_KEY, masterDocTitle);

      if (user) {
        setSyncStatus('syncing');
        await setDoc(doc(db, 'user_documents', user.uid), cleanFirestoreData({
          id: user.uid,
          ownerId: user.uid,
          title: masterDocTitle,
          categories: projects,
          boards: boards.map(b => ({ ...b, ownerId: user.uid, isCloud: true })),
          tasks: allTasks.map(t => ({ ...t, ownerId: user.uid })),
          boardSortPreference,
          updatedAt: new Date().toISOString(),
          version: '1.5.2'
        }), { merge: true });
        setSyncStatus('synced');
      }

      setLastSyncTime(new Date());
      showNotification(`Document complet "${masterDocTitle}" (${projects.length} catégories, ${boards.length} projets, ${allTasks.length} tâches) enregistré dans le Cloud en 1 seul document !`);
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('Erreur lors de l’enregistrement.');
    }
  };

  // Apply or load a template
  const applyTemplate = async (template: TaskFlowTemplate): Promise<string> => {
    // 1. If it's the registered standard workspace
    if (template.id === 'template-standard-workspace') {
      const existingStandard = boards.find(b => b.id.startsWith('board-pro') || b.title === 'Sprints & Développement');
      if (existingStandard) {
        setActiveBoardIdState(existingStandard.id);
        showNotification('Modèle Standard chargé : Accès à vos documents enregistrés');
        return existingStandard.id;
      }
    }

    // 2. Create the board(s) and tasks defined by the template
    let primaryBoardId = '';
    const newBoards: BoardDocument[] = [];
    const newTasks: Task[] = [];
    const ownerId = user ? user.uid : 'local-user';

    for (let i = 0; i < template.boards.length; i++) {
      const bDef = template.boards[i];
      const newBId = `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      if (i === 0) primaryBoardId = newBId;

      const newBoard: BoardDocument = {
        id: newBId,
        title: bDef.title,
        description: bDef.description || '',
        icon: bDef.icon || 'folder',
        color: bDef.color || template.color,
        ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCloud: !!user,
        order: boards.length + i,
        projectName: bDef.projectName || template.title,
      };

      newBoards.push(newBoard);

      // Distribute tasks: prioritize exact boardIndex or matching originalBoardId
      const matchingTasks = template.tasks.filter((tDef, tIdx) => {
        if (tDef.boardIndex !== undefined) {
          return tDef.boardIndex === i;
        }
        if (tDef.originalBoardId && bDef.originalBoardId) {
          return tDef.originalBoardId === bDef.originalBoardId;
        }
        return template.boards.length === 1 || tIdx % template.boards.length === i;
      });

      for (const tDef of matchingTasks) {
        const newTId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const newTask: Task = {
          id: newTId,
          boardId: newBId,
          ownerId,
          title: tDef.title,
          description: tDef.description || '',
          status: tDef.status,
          priority: tDef.priority || 'medium',
          category: tDef.category,
          tags: tDef.tags || [],
          subtasks: tDef.subtasks || [],
          screenshotUrl: tDef.screenshotUrl,
          order: tDef.order ?? 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newTasks.push(newTask);
      }
    }

    setBoards(prev => [...prev, ...newBoards]);
    setAllTasks(prev => [...prev, ...newTasks]);

    // Ensure all project names from the template are registered
    const projectsToAdd = Array.from(new Set(template.boards.map(b => b.projectName).filter(Boolean))) as string[];
    if (projectsToAdd.length > 0) {
      setProjects(prev => {
        const next = [...prev];
        for (const p of projectsToAdd) {
          if (!next.includes(p)) next.push(p);
        }
        return next;
      });
    }

    if (primaryBoardId) {
      setActiveBoardIdState(primaryBoardId);
    }

    showNotification(`Modèle appliqué avec succès : "${template.title}"`);
    return primaryBoardId || activeBoardId;
  };

  // Task Operations
  const createTask = async (
    taskData: Omit<Task, 'id' | 'boardId' | 'ownerId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const currentBoardId = activeBoardId;
    const newTask: Task = {
      ...taskData,
      id: taskId,
      boardId: currentBoardId,
      ownerId: user ? user.uid : 'local-user',
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let nextTasks: Task[] = [];
    setAllTasks((prev) => {
      nextTasks = [newTask, ...prev];
      safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(nextTasks));
      return nextTasks;
    });

    if (user && nextTasks.length > 0) {
      syncDocumentToFirestore(undefined, undefined, undefined, nextTasks);
    }

    showNotification(`Tâche ajoutée : "${newTask.title}"`);
    return taskId;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    let nextTasks: Task[] = [];
    setAllTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev;
      const updatedTask: Task = {
        ...targetTask,
        ...updates,
        updatedAt: now,
      };
      nextTasks = prev.map((t) => (t.id === taskId ? updatedTask : t));
      safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(nextTasks));
      return nextTasks;
    });

    if (user && nextTasks.length > 0) {
      syncDocumentToFirestore(undefined, undefined, undefined, nextTasks);
    }
  };

  const deleteTask = async (taskId: string) => {
    let nextTasks: Task[] = [];
    setAllTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev;
      nextTasks = prev.filter((t) => t.id !== taskId);
      safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(nextTasks));
      return nextTasks;
    });

    if (user) {
      syncDocumentToFirestore(undefined, undefined, undefined, nextTasks);
    }

    showNotification('Tâche supprimée.');
  };

  const moveTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const duplicateTask = async (taskId: string): Promise<string> => {
    const sourceTask = allTasks.find((t) => t.id === taskId);
    if (!sourceTask) return '';

    const newTaskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: Task = {
      ...sourceTask,
      id: newTaskId,
      title: `${sourceTask.title} (Copie)`,
      subtasks: sourceTask.subtasks ? sourceTask.subtasks.map((s) => ({ ...s, id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}` })) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let nextTasks: Task[] = [];
    setAllTasks((prev) => {
      nextTasks = [duplicated, ...prev];
      safeLocalStorageSet(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(nextTasks));
      return nextTasks;
    });

    if (user && nextTasks.length > 0) {
      syncDocumentToFirestore(undefined, undefined, undefined, nextTasks);
    }

    showNotification(`Tâche dupliquée : "${duplicated.title}"`);
    return newTaskId;
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const targetTask = allTasks.find((t) => t.id === taskId);
    if (!targetTask || !targetTask.subtasks) return;

    const updatedSubtasks = targetTask.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  // Auth actions
  const handleGoogleLogin = async () => {
    try {
      setSyncStatus('syncing');
      await loginWithGoogle();
      showNotification('Connecté avec succès !');
    } catch (err) {
      console.error('Google Sign-in failed', err);
      showNotification('Connexion Google annulée ou échouée.');
      setSyncStatus('local');
    }
  };

  const handleGoogleBrowserLogin = async () => {
    if (window.electronAPI?.openExternalBrowserAuth) {
      await window.electronAPI.openExternalBrowserAuth();
      showNotification('Fenêtre ouverte dans votre navigateur. Connectez-vous avec Google...');
    } else {
      await handleGoogleLogin();
    }
  };

  // Listen for Google Auth callback from external browser
  useEffect(() => {
    if (!window.electronAPI?.onGoogleAuthCredential) return;
    const unsub = window.electronAPI.onGoogleAuthCredential(async (data: any) => {
      try {
        setSyncStatus('syncing');
        if (data?.idToken) {
          await loginWithGoogleCredential(data.idToken, data.accessToken);
          showNotification('Connecté avec succès via votre navigateur !');
        }
      } catch (err: any) {
        console.error('Browser credential login error', err);
        showNotification('Échec connexion : ' + (err?.message || 'Erreur inconnue'));
        setSyncStatus('local');
      }
    });
    return () => unsub();
  }, [showNotification]);

  const handleEmailLogin = async (email: string, pass: string) => {
    try {
      setSyncStatus('syncing');
      await loginWithEmail(email, pass);
      showNotification('Connecté avec succès !');
    } catch (err: any) {
      console.error('Email sign-in failed', err);
      const msg = err?.message?.includes('user-not-found') 
        ? 'Compte introuvable. Veuillez créer un compte.' 
        : err?.message?.includes('wrong-password') || err?.message?.includes('invalid-credential')
        ? 'Mot de passe incorrect.'
        : 'Échec de connexion : ' + (err?.message || 'Erreur inconnue');
      showNotification(msg);
      setSyncStatus('local');
      throw err;
    }
  };

  const handleEmailRegister = async (email: string, pass: string, name?: string) => {
    try {
      setSyncStatus('syncing');
      await registerWithEmail(email, pass, name);
      showNotification('Compte créé avec succès !');
    } catch (err: any) {
      console.error('Registration failed', err);
      const msg = err?.message?.includes('email-already-in-use')
        ? 'Cet email possède déjà un compte. Essayez de vous connecter.'
        : err?.message?.includes('weak-password')
        ? 'Mot de passe trop court (min. 6 caractères).'
        : 'Échec création de compte : ' + (err?.message || 'Erreur');
      showNotification(msg);
      setSyncStatus('local');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showNotification('Déconnecté du compte.');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        user,
        isAuthLoading,
        syncStatus,
        lastSyncTime,
        boards,
        sortedBoards,
        activeBoard,
        activeBoardId,
        projects,
        teamSessions,
        boardSortPreference,
        setBoardSortPreference,
        reorderBoards,
        moveBoardOrder,
        createProject,
        deleteProject,
        renameProject,
        assignBoardToProject,
        reorderProjects,
        createTeamSession,
        joinTeamSession,
        leaveTeamSession,
        tasks: filteredTasks,
        allTasks,
        categories: DEFAULT_CATEGORIES,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedTag,
        setSelectedTag,
        selectedPriority,
        setSelectedPriority,
        masterDocTitle,
        setMasterDocTitle,
        createNewDocument,
        exportDocumentToFile,
        setActiveBoardId,
        createBoard,
        updateBoard,
        deleteBoard,
        exportBoardToFile,
        importBoardFromFile,
        saveCurrentDocument,
        applyTemplate,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        duplicateTask,
        toggleSubtask,
        signInWithGoogle: handleGoogleLogin,
        signInWithGoogleBrowser: handleGoogleBrowserLogin,
        signInWithEmail: handleEmailLogin,
        registerWithEmail: handleEmailRegister,
        signOut: handleLogout,
        notificationMessage,
        setNotificationMessage,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
