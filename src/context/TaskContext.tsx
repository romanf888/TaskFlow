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

  // Document / Board actions
  setActiveBoardId: (id: string) => void;
  createBoard: (title: string, description?: string, icon?: string, color?: string, projectName?: string, teamSessionCode?: string) => Promise<string>;
  updateBoard: (boardId: string, updates: Partial<BoardDocument>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  exportBoardToFile: (boardId: string) => void;
  importBoardFromFile: (file: File) => Promise<boolean>;
  saveCurrentDocument: () => void;

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

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'local'>('local');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Boards and tasks state
  const LOCAL_STORAGE_PROJECTS_KEY = 'taskflow_windows_projects_v2';
  const LOCAL_STORAGE_BOARD_SORT_KEY = 'taskflow_windows_board_sort_v2';

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
    return [
      {
        id: 'team_demo_1',
        code: 'TF-7892',
        name: 'Équipe UEFN & Devs',
        creatorId: 'user_admin',
        creatorName: 'Romain',
        members: [
          { id: 'mem_1', name: 'Romain', joinedAt: new Date().toISOString(), avatarColor: '#4285F4' },
          { id: 'mem_2', name: 'Alex', joinedAt: new Date().toISOString(), avatarColor: '#34A853' },
          { id: 'mem_3', name: 'Sophie', joinedAt: new Date().toISOString(), avatarColor: '#FBBC04' },
        ],
        createdAt: new Date().toISOString(),
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(teamSessions));
  }, [teamSessions]);

  const [boardSortPreference, setBoardSortPreferenceState] = useState<BoardSortPreference>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_BOARD_SORT_KEY);
    if (saved && ['custom', 'title-asc', 'title-desc', 'date-desc', 'date-asc'].includes(saved)) {
      return saved as BoardSortPreference;
    }
    return 'custom';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  const setBoardSortPreference = (pref: BoardSortPreference) => {
    setBoardSortPreferenceState(pref);
    localStorage.setItem(LOCAL_STORAGE_BOARD_SORT_KEY, pref);
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

  const createProject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!projects.includes(trimmed)) {
      setProjects((prev) => [...prev, trimmed]);
      showNotification(`Nouveau projet créé : "${trimmed}"`);
    }
  };

  const deleteProject = (name: string) => {
    setProjects((prev) => prev.filter((p) => p !== name));
    setBoards((prev) => prev.map((b) => b.projectName === name ? { ...b, projectName: undefined } : b));
    showNotification(`Projet "${name}" supprimé.`);
  };

  const renameProject = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setProjects((prev) => prev.map((p) => p === oldName ? trimmed : p));
    setBoards((prev) => prev.map((b) => b.projectName === oldName ? { ...b, projectName: trimmed } : b));
    showNotification(`Projet renommé en "${trimmed}".`);
  };

  const assignBoardToProject = (boardId: string, projectName?: string) => {
    const trimmed = projectName?.trim() || undefined;
    if (trimmed && !projects.includes(trimmed)) {
      setProjects((prev) => [...prev, trimmed]);
    }
    updateBoard(boardId, { projectName: trimmed });
    showNotification(trimmed ? `Document rattaché à "${trimmed}"` : `Document retiré du projet.`);
  };

  const reorderProjects = (newProjects: string[]) => {
    setProjects(newProjects);
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
    localStorage.setItem(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(allTasks));
  }, [allTasks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_BOARD_KEY, activeBoardId);
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

  // Real-time listener for joined Team Sessions
  useEffect(() => {
    if (teamSessions.length === 0) return;

    const unsubs: (() => void)[] = [];
    teamSessions.forEach((session) => {
      if (!session.code) return;
      try {
        const sessionRef = doc(db, 'team_sessions', session.code);
        const unsub = onSnapshot(sessionRef, (docSnap) => {
          if (docSnap.exists()) {
            const updatedData = { id: docSnap.id, ...docSnap.data() } as TeamSession;
            setTeamSessions((prev) =>
              prev.map((s) => (s.code === updatedData.code ? updatedData : s))
            );
          }
        });
        unsubs.push(unsub);
      } catch (e) {
        console.warn('Error subscribing to team session:', e);
      }
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [teamSessions.map((s) => s.code).join(',')]);

  // Firestore Sync when User is authenticated (Personal + Shared Team Boards)
  useEffect(() => {
    if (!user) {
      setSyncStatus('local');
      return;
    }

    setSyncStatus('syncing');
    const boardsPath = 'boards';

    // Query personal boards
    const personalBoardsQuery = query(
      collection(db, boardsPath),
      where('ownerId', '==', user.uid)
    );

    const activeTeamCodes = teamSessions.map((s) => s.code).filter(Boolean);

    const unsubscribeBoards = onSnapshot(
      personalBoardsQuery,
      async (personalSnapshot) => {
        const cloudBoards: BoardDocument[] = [];
        personalSnapshot.forEach((docSnap) => {
          cloudBoards.push({ id: docSnap.id, ...docSnap.data() } as BoardDocument);
        });

        // Also fetch team boards if user belongs to team sessions
        if (activeTeamCodes.length > 0) {
          try {
            for (const teamCode of activeTeamCodes) {
              const teamBoardsQuery = query(collection(db, boardsPath), where('teamSessionCode', '==', teamCode));
              const teamSnap = await import('firebase/firestore').then(m => m.getDocs(teamBoardsQuery));
              teamSnap.forEach((docSnap) => {
                if (!cloudBoards.some(b => b.id === docSnap.id)) {
                  cloudBoards.push({ id: docSnap.id, ...docSnap.data() } as BoardDocument);
                }
              });
            }
          } catch (e) {
            console.warn('Error fetching team boards:', e);
          }
        }

        if (cloudBoards.length === 0) {
          // First time cloud user: Migrate initial local boards to user's cloud account!
          try {
            for (const b of INITIAL_BOARDS) {
              const cleanBoard: BoardDocument = {
                ...b,
                ownerId: user.uid,
                isCloud: true,
                updatedAt: new Date().toISOString(),
              };
              await setDoc(doc(db, boardsPath, cleanBoard.id), cleanFirestoreData(cleanBoard));
            }
            // Also upload initial tasks
            for (const t of INITIAL_TASKS) {
              const cleanTask: Task = {
                ...t,
                ownerId: user.uid,
                updatedAt: new Date().toISOString(),
              };
              await setDoc(doc(db, `boards/${cleanTask.boardId}/tasks`, cleanTask.id), cleanFirestoreData(cleanTask));
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, boardsPath);
          }
        } else {
          setBoards(cloudBoards);
          // If active board isn't in user's boards, select first one
          if (!cloudBoards.some((b) => b.id === activeBoardId)) {
            setActiveBoardIdState(cloudBoards[0].id);
          }
        }
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      },
      (error) => {
        setSyncStatus('offline');
        handleFirestoreError(error, OperationType.LIST, boardsPath);
      }
    );

    return () => {
      unsubscribeBoards();
    };
  }, [user, activeBoardId, teamSessions.map((s) => s.code).join(',')]);

  // Sync tasks for current active board from Firestore (Shared for Team Board, Personal for private)
  useEffect(() => {
    if (!user || !activeBoardId) return;

    setSyncStatus('syncing');
    const tasksPath = `boards/${activeBoardId}/tasks`;
    const activeBoardObj = boards.find(b => b.id === activeBoardId);
    const isTeamBoard = !!activeBoardObj?.teamSessionCode;

    // For team boards, query all tasks without filtering ownerId so all team members see them
    const tasksQuery = isTeamBoard
      ? query(collection(db, tasksPath))
      : query(collection(db, tasksPath), where('ownerId', '==', user.uid));

    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const cloudTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          cloudTasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
        });

        setAllTasks((prev) => {
          // Merge tasks: keep tasks from other boards, replace active board tasks with cloud tasks
          const otherBoardTasks = prev.filter((t) => t.boardId !== activeBoardId);
          return [...otherBoardTasks, ...cloudTasks];
        });

        setSyncStatus('synced');
        setLastSyncTime(new Date());
      },
      (error) => {
        setSyncStatus('offline');
        handleFirestoreError(error, OperationType.LIST, tasksPath);
      }
    );

    return () => {
      unsubscribeTasks();
    };
  }, [user, activeBoardId, boards]);

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

    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardIdState(newId);

    if (user) {
      try {
        setSyncStatus('syncing');
        await setDoc(doc(db, 'boards', newId), cleanFirestoreData(newBoard));
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `boards/${newId}`);
      }
    }

    showNotification(`Nouveau document créé : "${title}"`);
    return newId;
  };

  const updateBoard = async (boardId: string, updates: Partial<BoardDocument>) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
    );

    if (user) {
      try {
        setSyncStatus('syncing');
        const boardRef = doc(db, 'boards', boardId);
        await setDoc(boardRef, cleanFirestoreData({ ...updates, updatedAt: new Date().toISOString() }), { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `boards/${boardId}`);
      }
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (boards.length <= 1) {
      showNotification('Impossible de supprimer le dernier document.');
      return;
    }

    const boardToDelete = boards.find((b) => b.id === boardId);
    const remainingBoards = boards.filter((b) => b.id !== boardId);
    setBoards(remainingBoards);
    setAllTasks((prev) => prev.filter((t) => t.boardId !== boardId));

    if (activeBoardId === boardId) {
      setActiveBoardIdState(remainingBoards[0].id);
    }

    if (user) {
      try {
        setSyncStatus('syncing');
        await deleteDoc(doc(db, 'boards', boardId));
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `boards/${boardId}`);
      }
    }

    showNotification(`Document "${boardToDelete?.title || boardId}" supprimé.`);
  };

  // Export board as .taskflow file (JSON)
  const exportBoardToFile = (boardId: string) => {
    const targetBoard = boards.find((b) => b.id === boardId);
    if (!targetBoard) return;

    const boardTasks = allTasks.filter((t) => t.boardId === boardId);
    const exportData = {
      app: 'TaskFlow Windows',
      version: '1.0',
      exportDate: new Date().toISOString(),
      board: targetBoard,
      tasks: boardTasks,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = targetBoard.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `${safeTitle}.taskflow`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(`Fichier "${targetBoard.title}.taskflow" téléchargé avec succès.`);
  };

  // Import board from .taskflow or .json file
  const importBoardFromFile = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.board || !data.board.title) {
        showNotification('Format de fichier invalide. Document TaskFlow attendu.');
        return false;
      }

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

      setBoards((prev) => [...prev, newBoard]);
      setAllTasks((prev) => [...prev, ...importedTasks]);
      setActiveBoardIdState(importedBoardId);

      if (user) {
        setSyncStatus('syncing');
        await setDoc(doc(db, 'boards', importedBoardId), cleanFirestoreData(newBoard));
        for (const t of importedTasks) {
          await setDoc(doc(db, `boards/${importedBoardId}/tasks`, t.id), cleanFirestoreData(t));
        }
        setSyncStatus('synced');
      }

      showNotification(`Document "${newBoard.title}" importé avec ${importedTasks.length} tâches.`);
      return true;
    } catch (e) {
      console.error('Import error', e);
      showNotification("Erreur lors de l'importation du fichier.");
      return false;
    }
  };

  const saveCurrentDocument = async () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BOARDS_KEY, JSON.stringify(boards));
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(allTasks));

      if (user && activeBoard) {
        setSyncStatus('syncing');
        await setDoc(doc(db, 'boards', activeBoard.id), cleanFirestoreData({
          ...activeBoard,
          ownerId: user.uid,
          isCloud: true,
          updatedAt: new Date().toISOString(),
        }), { merge: true });

        const boardTasks = allTasks.filter((t) => t.boardId === activeBoard.id);
        for (const task of boardTasks) {
          await setDoc(doc(db, `boards/${activeBoard.id}/tasks`, task.id), cleanFirestoreData(task), { merge: true });
        }
        setSyncStatus('synced');
      }

      setLastSyncTime(new Date());
      showNotification(`Document "${activeBoard?.title || 'Actif'}" enregistré avec succès !`);
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('Erreur lors de l’enregistrement.');
    }
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

    setAllTasks((prev) => [newTask, ...prev]);

    if (user) {
      try {
        setSyncStatus('syncing');
        // Ensure parent board document exists in Firestore
        const targetBoard = boards.find((b) => b.id === currentBoardId);
        if (targetBoard) {
          await setDoc(doc(db, 'boards', currentBoardId), cleanFirestoreData({
            ...targetBoard,
            ownerId: user.uid,
            isCloud: true,
            updatedAt: new Date().toISOString()
          }), { merge: true });
        }
        await setDoc(doc(db, `boards/${currentBoardId}/tasks`, taskId), cleanFirestoreData(newTask));
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `boards/${currentBoardId}/tasks/${taskId}`);
      }
    }

    showNotification(`Tâche ajoutée : "${newTask.title}"`);
    return taskId;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const targetTask = allTasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedTask: Task = {
      ...targetTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setAllTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    if (user) {
      try {
        setSyncStatus('syncing');
        const taskRef = doc(db, `boards/${targetTask.boardId}/tasks`, taskId);
        await setDoc(taskRef, cleanFirestoreData(updatedTask), { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `boards/${targetTask.boardId}/tasks/${taskId}`);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    const targetTask = allTasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (user) {
      try {
        setSyncStatus('syncing');
        await deleteDoc(doc(db, `boards/${targetTask.boardId}/tasks`, taskId));
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `boards/${targetTask.boardId}/tasks/${taskId}`);
      }
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

    setAllTasks((prev) => [duplicated, ...prev]);

    if (user) {
      try {
        setSyncStatus('syncing');
        await setDoc(doc(db, `boards/${duplicated.boardId}/tasks`, newTaskId), duplicated);
        setSyncStatus('synced');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `boards/${duplicated.boardId}/tasks/${newTaskId}`);
      }
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
        setActiveBoardId,
        createBoard,
        updateBoard,
        deleteBoard,
        exportBoardToFile,
        importBoardFromFile,
        saveCurrentDocument,
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
