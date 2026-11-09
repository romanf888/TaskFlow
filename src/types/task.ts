export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  subtasks?: Subtask[];
  screenshotUrl?: string; // Base64 data URL or external URL
  order?: number;
  boardId: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  joinedAt: string;
  avatarColor?: string;
}

export interface TeamSession {
  id: string;
  code: string; // 6-digit uppercase alphanumeric session code e.g. "TF-7892"
  name: string;
  creatorId: string;
  creatorName?: string;
  members: TeamMember[];
  createdAt: string;
}

export interface BoardDocument {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  isCloud?: boolean;
  order?: number;
  projectName?: string; // Nom du projet de rattachement
  teamSessionCode?: string; // Code de session d'équipe si document partagé
}

export type BoardSortPreference = 'custom' | 'title-asc' | 'title-desc' | 'date-desc' | 'date-asc';

export interface TagCategoryDefinition {
  id: string;
  name: string;
  color: string;
  badgeClass: string;
  suggestedTags: string[];
}

export const DEFAULT_CATEGORIES: TagCategoryDefinition[] = [
  {
    id: 'pro',
    name: 'Professionnel',
    color: '#3b82f6', // Vivid Blue
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    suggestedTags: ['Client', 'Urgent', 'Réunion', 'Livrable', 'Facturation', 'Revue'],
  },
  {
    id: 'dev',
    name: 'Développement',
    color: '#10b981', // Vivid Emerald
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    suggestedTags: ['Frontend', 'Backend', 'Bug', 'Feature', 'API', 'Refactor'],
  },
  {
    id: 'design',
    name: 'Design & UI',
    color: '#ec4899', // Vivid Pink
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    suggestedTags: ['Figma', 'Maquette', 'Illustration', 'Logo', 'Icônes'],
  },
  {
    id: 'perso',
    name: 'Personnel',
    color: '#8b5cf6', // Vivid Violet
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    suggestedTags: ['Maison', 'Famille', 'Santé', 'Administratif', 'Loisirs', 'Finance'],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    color: '#f59e0b', // Vivid Amber
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    suggestedTags: ['Réseaux', 'Newsletter', 'SEO', 'Contenu', 'Campagne'],
  },
];

export const STATUS_COLUMNS: { 
  id: TaskStatus; 
  label: string; 
  description: string; 
  accentColor: string;
  headerGradient: string;
  columnBg: string;
  borderActive: string;
  badgeClass: string;
  pillColor: string;
}[] = [
  {
    id: 'todo',
    label: 'À faire',
    description: 'Tâches à accomplir',
    accentColor: '#FF9500', // Apple System Orange
    headerGradient: 'from-[#FF9500]/15 via-[#FF9500]/5 to-transparent',
    columnBg: 'bg-[#1c1c1e]/90',
    borderActive: 'border-[#FF9500]/70 shadow-[#FF9500]/20 ring-2 ring-[#FF9500]/30',
    badgeClass: 'bg-[#FF9500] text-black font-semibold shadow-xs',
    pillColor: 'text-[#FF9500]',
  },
  {
    id: 'in_progress',
    label: 'En cours',
    description: 'Tâches en cours d’exécution',
    accentColor: '#007AFF', // Apple System Blue
    headerGradient: 'from-[#007AFF]/15 via-[#007AFF]/5 to-transparent',
    columnBg: 'bg-[#1c1c1e]/90',
    borderActive: 'border-[#007AFF]/70 shadow-[#007AFF]/20 ring-2 ring-[#007AFF]/30',
    badgeClass: 'bg-[#007AFF] text-white font-semibold shadow-xs',
    pillColor: 'text-[#007AFF]',
  },
  {
    id: 'done',
    label: 'Fait',
    description: 'Tâches terminées avec succès',
    accentColor: '#34C759', // Apple System Green
    headerGradient: 'from-[#34C759]/15 via-[#34C759]/5 to-transparent',
    columnBg: 'bg-[#1c1c1e]/90',
    borderActive: 'border-[#34C759]/70 shadow-[#34C759]/20 ring-2 ring-[#34C759]/30',
    badgeClass: 'bg-[#34C759] text-white font-semibold shadow-xs',
    pillColor: 'text-[#34C759]',
  },
];
