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
    accentColor: '#FBBC04', // Google Yellow
    headerGradient: 'from-[#FBBC04]/20 via-[#FBBC04]/5 to-transparent',
    columnBg: 'bg-[#1e1f20]/95',
    borderActive: 'border-[#FBBC04]/70 shadow-[#FBBC04]/20 ring-2 ring-[#FBBC04]/30',
    badgeClass: 'bg-[#FBBC04] text-slate-950 font-bold shadow-sm',
    pillColor: 'text-[#FBBC04]',
  },
  {
    id: 'in_progress',
    label: 'En cours',
    description: 'Tâches en cours d’exécution',
    accentColor: '#4285F4', // Google Blue
    headerGradient: 'from-[#4285F4]/20 via-[#4285F4]/5 to-transparent',
    columnBg: 'bg-[#1e1f20]/95',
    borderActive: 'border-[#4285F4]/70 shadow-[#4285F4]/20 ring-2 ring-[#4285F4]/30',
    badgeClass: 'bg-[#4285F4] text-white font-bold shadow-sm',
    pillColor: 'text-[#4285F4]',
  },
  {
    id: 'done',
    label: 'Fait',
    description: 'Tâches terminées avec succès',
    accentColor: '#34A853', // Google Green
    headerGradient: 'from-[#34A853]/20 via-[#34A853]/5 to-transparent',
    columnBg: 'bg-[#1e1f20]/95',
    borderActive: 'border-[#34A853]/70 shadow-[#34A853]/20 ring-2 ring-[#34A853]/30',
    badgeClass: 'bg-[#34A853] text-white font-bold shadow-sm',
    pillColor: 'text-[#34A853]',
  },
];
