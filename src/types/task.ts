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
}

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
    accentColor: '#f59e0b',
    headerGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    columnBg: 'bg-[#151824]/90',
    borderActive: 'border-amber-500/50 shadow-amber-500/10 ring-2 ring-amber-500/20',
    badgeClass: 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/40',
    pillColor: 'text-amber-400',
  },
  {
    id: 'in_progress',
    label: 'En cours',
    description: 'Tâches en cours d’exécution',
    accentColor: '#3b82f6',
    headerGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    columnBg: 'bg-[#151928]/90',
    borderActive: 'border-blue-500/50 shadow-blue-500/10 ring-2 ring-blue-500/20',
    badgeClass: 'bg-blue-500 text-white font-bold shadow-sm shadow-blue-500/40',
    pillColor: 'text-blue-400',
  },
  {
    id: 'done',
    label: 'Fait',
    description: 'Tâches terminées avec succès',
    accentColor: '#10b981',
    headerGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    columnBg: 'bg-[#141b24]/90',
    borderActive: 'border-emerald-500/50 shadow-emerald-500/10 ring-2 ring-emerald-500/20',
    badgeClass: 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/40',
    pillColor: 'text-emerald-400',
  },
];
