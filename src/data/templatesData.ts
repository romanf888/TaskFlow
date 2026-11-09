import { BoardDocument, Task } from '../types/task';
import { INITIAL_BOARDS, INITIAL_TASKS } from './initialData';

export type TemplateCategory = 'registered' | 'blank' | 'tech' | 'business' | 'marketing' | 'personal' | 'preset' | 'custom';

export interface TaskFlowTemplate {
  id: string;
  title: string;
  subtitle: string;
  category: TemplateCategory;
  description: string;
  badge?: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  isPresetGroup?: boolean;
  categoryName?: string;
  createdAt?: string;
  boards: (Omit<BoardDocument, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { originalBoardId?: string })[];
  tasks: (Omit<Task, 'id' | 'boardId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { boardIndex?: number; originalBoardId?: string })[];
}

export const TEMPLATES_CATALOG: TaskFlowTemplate[] = [
  // 1. Existing registered model (Current document group)
  {
    id: 'template-standard-workspace',
    title: 'Modèle Standard TaskFlow',
    subtitle: 'Groupement de documents existant enregistré',
    category: 'registered',
    badge: 'Modèle Enregistré',
    description: 'Votre espace de travail complet comprenant 3 projets distincts : Sprints & Dév, Design UI et Organisation Personnelle.',
    icon: 'layers',
    color: '#007AFF',
    boards: INITIAL_BOARDS.map(b => ({
      title: b.title,
      description: b.description,
      icon: b.icon,
      color: b.color,
      projectName: b.projectName,
      order: b.order,
    })),
    tasks: INITIAL_TASKS.map(t => ({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      category: t.category,
      tags: t.tags,
      subtasks: t.subtasks,
      screenshotUrl: t.screenshotUrl,
      order: t.order,
    })),
  },

  // 2. Blank document
  {
    id: 'template-blank-board',
    title: 'Tableau Vierge',
    subtitle: 'Partir d’une page blanche',
    category: 'blank',
    badge: 'Nouveau',
    description: 'Créez un nouveau document propre avec les 3 colonnes fluides pour démarrer immédiatement votre projet.',
    icon: 'plus',
    color: '#34C759',
    boards: [
      {
        title: 'Nouveau Document',
        description: 'Tableau de tâches vierge',
        icon: 'briefcase',
        color: '#007AFF',
        projectName: 'Projet Principal',
        order: 0,
      }
    ],
    tasks: [],
  },

  // 3. Agile Sprint & Delivery
  {
    id: 'template-agile-sprint',
    title: 'Gestion de Projet Agile & Sprint',
    subtitle: 'Méthodologie Scrum / Kanban',
    category: 'tech',
    badge: 'Technique',
    description: 'Idéal pour piloter un cycle de sprint, assigner des user stories, tester les fonctionnalités et livrer en production.',
    icon: 'code',
    color: '#007AFF',
    boards: [
      {
        title: 'Sprint Actuel & Livrables',
        description: 'Suivi du sprint en cours et livraison de code',
        icon: 'code',
        color: '#007AFF',
        projectName: 'Développement Agile',
        order: 0,
      }
    ],
    tasks: [
      {
        title: 'Raffinement du Backlog et User Stories',
        description: 'Découper les fonctionnalités prioritaires avec critères d\'acceptation.',
        status: 'done',
        priority: 'high',
        category: 'Développement',
        tags: ['Scrum', 'Backlog', 'Sprint'],
        subtasks: [
          { id: 's1', title: 'Définir les specs de l\'API', completed: true },
          { id: 's2', title: 'Valider l\'architecture avec l\'équipe', completed: true },
        ],
        order: 0,
      },
      {
        title: 'Implémentation des endpoints d\'authentification',
        description: 'Sécuriser les routes d\'authentification avec JWT et sessions.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Développement',
        tags: ['Backend', 'Sécurité', 'API'],
        subtasks: [
          { id: 's3', title: 'Mise en place des tokens', completed: true },
          { id: 's4', title: 'Tests unitaires et intégration', completed: false },
        ],
        order: 1,
      },
      {
        title: 'Tests automatisés et revue de code QA',
        description: 'Vérifier la non-régression et valider la pull request.',
        status: 'todo',
        priority: 'medium',
        category: 'Développement',
        tags: ['QA', 'Review', 'Tests'],
        subtasks: [
          { id: 's5', title: 'Couverture de code > 80%', completed: false },
          { id: 's6', title: 'Validation sur l\'environnement de staging', completed: false },
        ],
        order: 2,
      },
      {
        title: 'Déploiement en production et monitoring',
        description: 'Publier la nouvelle version et vérifier les métriques de télémétrie.',
        status: 'todo',
        priority: 'high',
        category: 'Professionnel',
        tags: ['DevOps', 'Release', 'Monitoring'],
        subtasks: [
          { id: 's7', title: 'Tag de release v1.0', completed: false },
        ],
        order: 3,
      }
    ],
  },

  // 4. Product Roadmap & Tech
  {
    id: 'template-product-roadmap',
    title: 'Roadmap Produit & Tech',
    subtitle: 'Planification stratégique trimestrielle',
    category: 'tech',
    badge: 'Produit',
    description: 'Cartographiez vos objectifs stratégiques, spécifications produit, étapes clés et jalons de livraison.',
    icon: 'rocket',
    color: '#AF52DE',
    boards: [
      {
        title: 'Feuille de Route Produit',
        description: 'Objectifs trimestriels et jalons clés',
        icon: 'rocket',
        color: '#AF52DE',
        projectName: 'Direction Produit',
        order: 0,
      }
    ],
    tasks: [
      {
        title: 'Étude d\'opportunité et retours utilisateurs',
        description: 'Analyser les retours clients et synthétiser les 3 points de friction majeurs.',
        status: 'done',
        priority: 'medium',
        category: 'Professionnel',
        tags: ['UX', 'Recherche', 'Utilisateurs'],
        subtasks: [
          { id: 'r1', title: '10 entretiens qualitatifs menés', completed: true },
        ],
        order: 0,
      },
      {
        title: 'Conception des maquettes interactives v2',
        description: 'Prototyper les nouveaux flux utilisateurs et valider l\'ergonomie.',
        status: 'in_progress',
        priority: 'high',
        category: 'Design & UI',
        tags: ['Figma', 'Prototype', 'Design'],
        subtasks: [
          { id: 'r2', title: 'Flux d\'onboarding mobile', completed: true },
          { id: 'r3', title: 'Design system tokens', completed: false },
        ],
        order: 1,
      },
      {
        title: 'Lancement du programme Beta fermée',
        description: 'Ouvrir les accès aux 50 premiers utilisateurs testeurs.',
        status: 'todo',
        priority: 'urgent',
        category: 'Professionnel',
        tags: ['Beta', 'Lancement', 'Feedback'],
        subtasks: [
          { id: 'r4', title: 'Emailing d\'invitation', completed: false },
          { id: 'r5', title: 'Mise en place formulaire retour', completed: false },
        ],
        order: 2,
      }
    ],
  },

  // 5. Marketing Strategy & Content
  {
    id: 'template-marketing-campaigns',
    title: 'Stratégie Marketing & Campagnes',
    subtitle: 'Communication, réseaux & acquisition',
    category: 'marketing',
    badge: 'Marketing',
    description: 'Gérez votre planning éditorial, création de contenus, campagnes d’acquisition et analyses d’impact.',
    icon: 'sparkles',
    color: '#FF9500',
    boards: [
      {
        title: 'Campagnes & Contenus Marketing',
        description: 'Gestion des réseaux sociaux, articles et newsletters',
        icon: 'sparkles',
        color: '#FF9500',
        projectName: 'Marketing & Com',
        order: 0,
      }
    ],
    tasks: [
      {
        title: 'Rédaction du calendrier éditorial mensuel',
        description: 'Planifier les 12 publications réseaux et les 2 newsletters du mois.',
        status: 'done',
        priority: 'medium',
        category: 'Marketing',
        tags: ['Planning', 'Contenu', 'Réseaux'],
        subtasks: [
          { id: 'm1', title: 'Sélection des sujets clés', completed: true },
        ],
        order: 0,
      },
      {
        title: 'Création des visuels et vidéos courtes (Reels/Shorts)',
        description: 'Produire les formats vidéo démonstration de l\'application.',
        status: 'in_progress',
        priority: 'high',
        category: 'Design & UI',
        tags: ['Vidéo', 'Création', 'TikTok'],
        subtasks: [
          { id: 'm2', title: 'Tournage capture d\'écran', completed: true },
          { id: 'm3', title: 'Montage et sous-titres', completed: false },
        ],
        order: 1,
      },
      {
        title: 'Campagne de relance par email (Newsletter)',
        description: 'Diffuser la mise à jour majeure à la liste des abonnés inscrits.',
        status: 'todo',
        priority: 'urgent',
        category: 'Marketing',
        tags: ['Newsletter', 'Emailing', 'Conversion'],
        subtasks: [
          { id: 'm4', title: 'Rédiger l\'objet accrocheur', completed: false },
          { id: 'm5', title: 'Test d\'envoi sur boîte test', completed: false },
        ],
        order: 2,
      }
    ],
  },

  // 6. Freelance & Client Tracking
  {
    id: 'template-freelance-client',
    title: 'Suivi Client & Missions Freelance',
    subtitle: 'Du devis à la facturation finale',
    category: 'business',
    badge: 'Business',
    description: 'Suivez chaque client de la prise de brief au devis, à la réalisation du projet et au règlement de facture.',
    icon: 'briefcase',
    color: '#34C759',
    boards: [
      {
        title: 'Portefeuille Clients & Missions',
        description: 'Pipeline commercial, réalisations et factures',
        icon: 'briefcase',
        color: '#34C759',
        projectName: 'Activité Freelance',
        order: 0,
      }
    ],
    tasks: [
      {
        title: 'Cadrage et signature devis Client Horizon',
        description: 'Validation du cahier des charges et acompte de 30% reçu.',
        status: 'done',
        priority: 'high',
        category: 'Professionnel',
        tags: ['Devis', 'Client', 'Contrat'],
        subtasks: [
          { id: 'f1', title: 'Devis signé électroniquement', completed: true },
          { id: 'f2', title: 'Acompte réceptionné', completed: true },
        ],
        order: 0,
      },
      {
        title: 'Développement du site vitrine et intégration responsive',
        description: 'Phase de réalisation principale selon la maquette validée.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Développement',
        tags: ['Frontend', 'Livrable', 'En cours'],
        subtasks: [
          { id: 'f3', title: 'Intégration page d\'accueil', completed: true },
          { id: 'f4', title: 'Formulaire de contact dynamique', completed: false },
        ],
        order: 1,
      },
      {
        title: 'Livraison finale, formation client & solde de facture',
        description: 'Transfert des accès administrateur et clôture du dossier.',
        status: 'todo',
        priority: 'medium',
        category: 'Professionnel',
        tags: ['Livraison', 'Facture', 'Clôture'],
        subtasks: [
          { id: 'f5', title: 'Guide d\'administration rédigé', completed: false },
          { id: 'f6', title: 'Envoi facture de solde', completed: false },
        ],
        order: 2,
      }
    ],
  },

  // 7. Personal Organization & Goals
  {
    id: 'template-personal-goals',
    title: 'Organisation Personnelle & Habitudes',
    subtitle: 'Équilibre de vie, maison & loisirs',
    category: 'personal',
    badge: 'Personnel',
    description: 'Structurez vos priorités personnelles, finances, voyages, routines quotidiennes et démarches administratives.',
    icon: 'home',
    color: '#8B5CF6',
    boards: [
      {
        title: 'Vie Quotidienne & Objectifs',
        description: 'Routines, projets persos et démarches',
        icon: 'home',
        color: '#8B5CF6',
        projectName: 'Personnel',
        order: 0,
      }
    ],
    tasks: [
      {
        title: 'Inscription salle de sport & planification séances',
        description: 'Définir un créneau régulier de 3 séances par semaine.',
        status: 'done',
        priority: 'medium',
        category: 'Personnel',
        tags: ['Santé', 'Sport', 'Routine'],
        subtasks: [
          { id: 'p1', title: 'Abonnement validé', completed: true },
        ],
        order: 0,
      },
      {
        title: 'Préparation du voyage d\'été (Itinéraire et Réservations)',
        description: 'Comparer les hébergements et réserver les billets de train.',
        status: 'in_progress',
        priority: 'high',
        category: 'Personnel',
        tags: ['Voyage', 'Vacances', 'Budget'],
        subtasks: [
          { id: 'p2', title: 'Choisir la destination', completed: true },
          { id: 'p3', title: 'Réserver l\'hôtel', completed: false },
        ],
        order: 1,
      },
      {
        title: 'Tri administratif et déclaration annuelle',
        description: 'Classer les factures et reçus dans les dossiers correspondants.',
        status: 'todo',
        priority: 'low',
        category: 'Personnel',
        tags: ['Administratif', 'Maison'],
        subtasks: [
          { id: 'p4', title: 'Télécharger les attestations', completed: false },
        ],
        order: 2,
      }
    ],
  },
];
