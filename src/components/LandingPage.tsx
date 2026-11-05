import React, { useState } from 'react';
import { 
  Rocket, 
  Download, 
  BookOpen, 
  Users, 
  FolderPlus, 
  CheckCircle2, 
  Sparkles, 
  Monitor, 
  Sun, 
  Moon, 
  Key, 
  MousePointer, 
  HardDrive, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  Layers,
  Search,
  Check,
  Code
} from 'lucide-react';
import { TaskFlowLogo } from './TaskFlowLogo';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wiki'>('overview');
  const [activeWikiTopic, setActiveWikiTopic] = useState<'start' | 'projects' | 'team' | 'themes' | 'export' | 'download'>('start');

  const handleDownloadExe = () => {
    window.open('https://github.com/romanf888/TaskFlow/releases/latest', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0f1322] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#161a2b]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <TaskFlowLogo size={32} showText={true} />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`hover:text-white transition-colors cursor-pointer ${activeTab === 'overview' ? 'text-[#4285F4] font-bold' : ''}`}
          >
            Présentation
          </button>
          <button 
            onClick={() => setActiveTab('wiki')} 
            className={`hover:text-white transition-colors cursor-pointer flex items-center space-x-1 ${activeTab === 'wiki' ? 'text-[#4285F4] font-bold' : ''}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wiki & Guide</span>
          </button>
          <a 
            href="https://github.com/romanf888/TaskFlow" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors flex items-center space-x-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadExe}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#34A853]" />
            <span>Télécharger (.exe)</span>
          </button>

          <button
            onClick={onLaunchApp}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold shadow-lg shadow-[#4285F4]/30 hover:scale-105 transition-all cursor-pointer"
          >
            <Rocket className="w-4 h-4 fill-current" />
            <span>Lancer l'App Web</span>
          </button>
        </div>
      </header>

      {/* Overview Showcase Tab */}
      {activeTab === 'overview' && (
        <main className="flex-1">
          {/* Hero Banner Section */}
          <section className="relative px-4 sm:px-8 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#8ab4f8] text-xs font-semibold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collaboration d'Équipe Google & Multi-Projets</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Le Gestionnaire de Tâches <br />
              <span className="bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC04] bg-clip-text text-transparent">
                Ultra-Rapide & Collaboratif
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              TaskFlow vous permet d'organiser vos tâches professionnelles et personnelles en équipe avec des comptes Google authentifiés, un glisser-déposer intuitif à la souris et une interface Material You réactive.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-sm font-bold shadow-xl shadow-[#4285F4]/40 hover:scale-105 transition-all cursor-pointer flex items-center justify-center space-x-2.5"
              >
                <Rocket className="w-5 h-5" />
                <span>Ouvrir TaskFlow dans le Navigateur</span>
              </button>

              <button
                onClick={handleDownloadExe}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#282a2d] hover:bg-[#323639] border border-white/15 text-white text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2.5"
              >
                <Download className="w-5 h-5 text-[#34A853]" />
                <span>Télécharger la version Windows (.exe)</span>
              </button>

              <button
                onClick={() => setActiveTab('wiki')}
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-4 h-4 text-[#FBBC04]" />
                <span>Consulter la Documentation</span>
              </button>
            </div>

            {/* App Visual Preview Frame */}
            <div className="pt-10 max-w-5xl mx-auto">
              <div className="p-2 sm:p-4 rounded-3xl bg-[#1e2338] border border-white/15 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#141726] rounded-t-2xl text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">TaskFlow — Application de Gestion</span>
                  <span className="text-[10px] text-[#34A853] font-bold">● Compte Google Synchronisé</span>
                </div>

                <div className="p-6 bg-[#0f1322] rounded-b-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* Column 1: À faire */}
                  <div className="p-4 rounded-2xl bg-[#181c2e] border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-xs">À faire (3)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">+ Ajouter</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#22273d] border border-white/10 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-xs font-semibold text-white">Finaliser la proposition commerciale</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Valider les tarifs et le cahier des charges avec l'équipe projet.</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">#ProjetPro</span>
                        <span>📷 Capture d'écran</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: En cours */}
                  <div className="p-4 rounded-2xl bg-[#181c2e] border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400 text-xs">En cours (2)</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">Actif</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#22273d] border border-white/10 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-xs font-semibold text-white">Projet Marketing & Stratégie</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Code de session: TF-XXXX. Partage en direct entre comptes Google authentifiés.</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">👥 Comptes Google Connectés</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Fait */}
                  <div className="p-4 rounded-2xl bg-[#181c2e] border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 text-xs">Fait (5)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Terminé</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#22273d] border border-white/10 space-y-1.5 opacity-80">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                        <span className="text-xs font-semibold text-white line-through">Glisser-Déposer des documents</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Support complet du réordonnancement à la souris dans la barre latérale.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid Section */}
          <section className="px-4 sm:px-8 py-16 bg-[#141828] border-t border-white/10">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Tout ce dont vous avez besoin pour vos tâches
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Une suite complète d'outils modernes pensés pour la productivité et la clarté professionnelle.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-[#1c2136] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/20 text-[#4285F4] flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Sessions Collaboratives Google</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Créez un code de session d'équipe (ex: TF-XXXX) et partagez-le avec vos collègues. Chaque membre se connecte avec son compte Google authentifié pour collaborer en direct.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#1c2136] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FBBC04]/20 text-[#FBBC04] flex items-center justify-center font-bold">
                    <MousePointer className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Espaces & Glisser-Déposer</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Classez vos documents dans des dossiers de projets et déplacez-les à la souris par simple glissement pour réordonner vos priorités.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#1c2136] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#34A853]/20 text-[#34A853] flex items-center justify-center font-bold">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Web & Bureau Windows (.exe)</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Accédez à l'application dans votre navigateur ou téléchargez l'exécutable Windows NSIS autonome avec mises à jour automatiques.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Wiki & Documentation Tab */}
      {activeTab === 'wiki' && (
        <main className="flex-1 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-[#4285F4] uppercase tracking-wider">Documentation Officielle</span>
              <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
                Wiki & Manuel d'Utilisation TaskFlow
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Guide complet pour maîtriser les fonctionnalités, le travail en équipe et l'exportation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
              {/* Sidebar Topics Menu */}
              <div className="space-y-1.5 md:col-span-1">
                {[
                  { id: 'start', label: '1. Démarrage Rapide', icon: Rocket },
                  { id: 'projects', label: '2. Espaces & Projets', icon: FolderPlus },
                  { id: 'team', label: '3. Sessions d\'Équipe Google', icon: Users },
                  { id: 'themes', label: '4. Thèmes & Raccourcis', icon: Sun },
                  { id: 'export', label: '5. Export .taskflow & Cache', icon: HardDrive },
                  { id: 'download', label: '6. Installation Windows (.exe)', icon: Download },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = activeWikiTopic === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveWikiTopic(item.id as any)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/30' 
                          : 'bg-[#181c2e] text-slate-300 hover:bg-[#22273d] hover:text-white'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Topic Detail Content */}
              <div className="md:col-span-3 bg-[#181c2e] border border-white/10 rounded-3xl p-6 text-slate-200 text-xs leading-relaxed space-y-4">
                {activeWikiTopic === 'start' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Rocket className="w-4 h-4 text-[#4285F4]" />
                      <span>Démarrage Rapide avec TaskFlow</span>
                    </h3>
                    <p>
                      TaskFlow est structuré autour de 3 colonnes de statut essentielles : <strong>À faire</strong>, <strong>En cours</strong>, et <strong>Fait</strong>.
                    </p>
                    <div className="p-3 rounded-2xl bg-[#0f1322] border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white">Comment créer une tâche ?</h4>
                      <p>Cliquez sur le bouton <strong>"+ Nouvelle Tâche"</strong> en haut ou utilisez le raccourci <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">Ctrl + T</kbd>. Vous pouvez renseigner un titre, une description, des sous-tâches, une catégorie, des étiquettes et joindre des captures d'écran.</p>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'projects' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <FolderPlus className="w-4 h-4 text-[#FBBC04]" />
                      <span>Gestion des Espaces & Dossiers de Projets</span>
                    </h3>
                    <p>
                      Organisez vos tableaux par dossiers (ex: "Développement Web", "Stratégie Marketing", "Personnel").
                    </p>
                    <div className="p-3 rounded-2xl bg-[#0f1322] border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white">Glisser-Déposer à la souris :</h4>
                      <p>Dans le volet latéral, vous pouvez saisir n'importe quel document à la souris pour le réordonner au-dessus ou en-dessous d'un autre document, ou le glisser directement sur l'en-tête d'un dossier pour le classer.</p>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'team' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#34A853]" />
                      <span>Sessions d'Équipe & Comptes Google Authentifiés</span>
                    </h3>
                    <p>
                      Partagez des tableaux de tâches avec vos collègues en associant leurs vrais comptes Google.
                    </p>
                    <div className="p-3 rounded-2xl bg-[#0f1322] border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white">Créer ou Rejoindre une session d'équipe :</h4>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Dans le volet latéral sous <strong>"Équipes & Documents Partagés"</strong>, cliquez sur <strong>"+ Créer une équipe"</strong> ou <strong>"🔑 Rejoindre par code"</strong>.</li>
                        <li>Connectez-vous à votre compte Google pour authentifier votre profil membre.</li>
                        <li>Transmettez le code de session généré (ex: <code>TF-XXXX</code>) à vos collaborateurs.</li>
                        <li>Chaque membre connecté apparaît avec son profil Google (nom, photo et email) et peut quitter la session à tout moment.</li>
                      </ol>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'themes' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-[#FBBC04]" />
                      <span>Thèmes, Apparence & Raccourcis Clavier</span>
                    </h3>
                    <p>
                      Basculez en 1 clic entre le <strong>Mode Système</strong> (auto), <strong>Mode Clair</strong> et <strong>Mode Sombre</strong> via le bouton dans l'en-tête principal.
                    </p>
                  </div>
                )}

                {activeWikiTopic === 'export' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-[#4285F4]" />
                      <span>Exportation, Importation `.taskflow` & Vidage de Cache</span>
                    </h3>
                    <p>
                      Sauvegardez vos documents sous forme de fichier local <code>.taskflow</code> à tout moment ou videz le cache d'application dans les Paramètres &gt; Stockage.
                    </p>
                  </div>
                )}

                {activeWikiTopic === 'download' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Download className="w-4 h-4 text-[#34A853]" />
                      <span>Installation de l'Application Bureau Windows (.exe)</span>
                    </h3>
                    <p>
                      L'application de bureau Windows est générée avec Electron et NSIS.
                    </p>
                    <button
                      onClick={handleDownloadExe}
                      className="px-5 py-2.5 bg-[#34A853] hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center space-x-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger la dernière version (.exe)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-[#0b0e19] border-t border-white/10 px-6 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <TaskFlowLogo size={24} showText={true} />
        </div>
        <p>© 2026 TaskFlow — Gestionnaire de Tâches Multi-Projets & Collaboratif.</p>
        <button onClick={onLaunchApp} className="text-[#4285F4] hover:underline font-semibold cursor-pointer">
          Accéder à l'application Web →
        </button>
      </footer>
    </div>
  );
};
