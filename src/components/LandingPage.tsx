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
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Apple Ambient Wallpaper Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#007AFF]/20 via-[#5856D6]/15 to-[#AF52DE]/10 blur-[130px] pointer-events-none rounded-full opacity-70" />

      {/* Top Header Navigation — Apple Glass */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
          <TaskFlowLogo size={32} showText={true} />
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-medium text-slate-300">
             Apple Design Edition
          </span>
        </div>

        {/* Apple Segmented Control Navbar */}
        <nav className="p-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md flex items-center space-x-1 text-xs font-medium text-slate-300">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-[#007AFF] text-white font-semibold shadow-md shadow-[#007AFF]/30' : 'hover:text-white hover:bg-white/5'}`}
          >
            Présentation
          </button>
          <button 
            onClick={() => setActiveTab('wiki')} 
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center space-x-1.5 ${activeTab === 'wiki' ? 'bg-[#007AFF] text-white font-semibold shadow-md shadow-[#007AFF]/30' : 'hover:text-white hover:bg-white/5'}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Wiki & Guide</span>
          </button>
          <a 
            href="https://github.com/romanf888/TaskFlow" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/5 transition-all flex items-center space-x-1"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadExe}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold transition-all apple-btn-active cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#34C759]" />
            <span>macOS / Windows (.exe)</span>
          </button>

          <button
            onClick={onLaunchApp}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-bold shadow-lg shadow-[#007AFF]/30 apple-btn-active transition-all cursor-pointer"
          >
            <Rocket className="w-4 h-4 fill-current" />
            <span>Ouvrir l'App</span>
          </button>
        </div>
      </header>

      {/* Overview Showcase Tab */}
      {activeTab === 'overview' && (
        <main className="flex-1 relative z-10">
          {/* Hero Banner Section */}
          <section className="relative px-4 sm:px-8 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-medium backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Conçu avec la rigueur & l'élégance Apple HIG</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
              La Clarté. <br />
              <span className="bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#FF2D55] bg-clip-text text-transparent font-bold">
                Redéfinie pour vos Tâches.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal tracking-wide">
              TaskFlow associe la puissance de la synchronisation temps réel Google Cloud à l'esthétique épurée des interfaces macOS & iOS. Glisser-déposer fluide, verre dépoli et organisation sans effort.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white text-sm font-semibold shadow-2xl shadow-[#007AFF]/40 apple-btn-active transition-all cursor-pointer flex items-center justify-center space-x-2.5"
              >
                <Rocket className="w-5 h-5" />
                <span>Lancer TaskFlow Web</span>
              </button>

              <button
                onClick={handleDownloadExe}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl text-white text-sm font-semibold apple-btn-active transition-all cursor-pointer flex items-center justify-center space-x-2.5"
              >
                <Download className="w-5 h-5 text-[#34C759]" />
                <span>Télécharger l'application Windows (.exe)</span>
              </button>

              <button
                onClick={() => setActiveTab('wiki')}
                className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium apple-btn-active transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-4 h-4 text-[#FF9500]" />
                <span>Guide & Documentation</span>
              </button>
            </div>

            {/* Apple macOS Preview Window */}
            <div className="pt-12 max-w-5xl mx-auto">
              <div className="p-3 sm:p-5 rounded-[32px] bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                {/* macOS Titlebar Traffic Lights */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40 rounded-t-[22px] text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/20 shadow-inner" />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/20 shadow-inner" />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/20 shadow-inner" />
                  </div>
                  <span className="font-semibold text-[12px] text-slate-300 tracking-wide">TaskFlow — macOS Sonoma & Web</span>
                  <span className="text-[11px] text-[#34C759] font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                    <span>En direct</span>
                  </span>
                </div>

                <div className="p-6 bg-[#1c1c1e]/90 rounded-b-[22px] grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  {/* Column 1: À faire */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#FF9500] text-xs uppercase tracking-wider">À faire (3)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FF9500]/20 text-[#FF9500] text-[10px] font-bold">+ Ajouter</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1.5 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
                        <span className="text-xs font-medium text-white">Finaliser la proposition commerciale</span>
                      </div>
                      <p className="text-[11px] text-slate-300">Valider les tarifs et le cahier des charges avec l'équipe projet.</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF] font-medium">#ProjetPro</span>
                        <span>📷 Capture d'écran</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: En cours */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#007AFF] text-xs uppercase tracking-wider">En cours (2)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF] text-[10px] font-bold">Actif</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1.5 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
                        <span className="text-xs font-medium text-white">Projet Marketing & Stratégie</span>
                      </div>
                      <p className="text-[11px] text-slate-300">Code de session: TF-XXXX. Partage en direct entre comptes Google authentifiés.</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                        <span className="px-2 py-0.5 rounded-full bg-[#34C759]/20 text-[#34C759] font-medium">👥 Comptes Google Sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Fait */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#34C759] text-xs uppercase tracking-wider">Fait (5)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#34C759]/20 text-[#34C759] text-[10px] font-bold">Terminé</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1.5 shadow-lg opacity-85">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                        <span className="text-xs font-medium text-white line-through">Glisser-Déposer des documents</span>
                      </div>
                      <p className="text-[11px] text-slate-300">Support complet du réordonnancement à la souris avec retour tactile visuel.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Apple Features Grid Section */}
          <section className="px-4 sm:px-8 py-20 bg-black/80 border-t border-white/10 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  Conçu dans les moindres détails
                </h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto font-normal">
                  Une expérience unifiée qui allie performance moderne et sobriété scandinave & Apple.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[28px] bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-2xl transition-all duration-300 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Sessions Collaboratives Google</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">
                    Créez un code de session d'équipe (ex: TF-XXXX) et partagez-le instantanément. Chaque membre accède à l'espace avec son compte Google officiel.
                  </p>
                </div>

                <div className="p-8 rounded-[28px] bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-2xl transition-all duration-300 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF9500]/20 text-[#FF9500] flex items-center justify-center font-bold">
                    <MousePointer className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Interface Tactile & Pointeur</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">
                    Reclassez vos dossiers de projets et déplacez vos tableaux de tâches par simple glisser-déposer direct à la souris.
                  </p>
                </div>

                <div className="p-8 rounded-[28px] bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-2xl transition-all duration-300 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#34C759]/20 text-[#34C759] flex items-center justify-center font-bold">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Multiplateforme & Bureau</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">
                    Utilisable directement dans n'importe quel navigateur moderne ou installable comme application de bureau sous Windows (.exe).
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Wiki & Documentation Tab */}
      {activeTab === 'wiki' && (
        <main className="flex-1 px-4 sm:px-8 py-12 max-w-6xl mx-auto w-full relative z-10">
          <div className="space-y-8">
            <div>
              <span className="text-xs font-semibold text-[#007AFF] uppercase tracking-widest">Documentation Officielle</span>
              <h1 className="text-3xl sm:text-5xl font-semibold text-white mt-2 tracking-tight">
                Wiki & Manuel TaskFlow
              </h1>
              <p className="text-slate-400 text-sm mt-2 font-normal">
                Guide complet de référence pour maîtriser vos tableaux, vos équipes et vos sauvegardes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
              {/* Sidebar Topics Menu */}
              <div className="space-y-2 md:col-span-1">
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
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-medium flex items-center space-x-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#007AFF] text-white shadow-xl shadow-[#007AFF]/30' 
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Topic Detail Content */}
              <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-[28px] backdrop-blur-2xl p-7 text-slate-200 text-xs leading-relaxed space-y-5">
                {activeWikiTopic === 'start' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Rocket className="w-5 h-5 text-[#007AFF]" />
                      <span>Démarrage Rapide avec TaskFlow</span>
                    </h3>
                    <p className="text-slate-300">
                      TaskFlow est structuré autour de 3 colonnes de statut essentielles : <strong>À faire</strong>, <strong>En cours</strong>, et <strong>Fait</strong>.
                    </p>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white">Comment créer une tâche ?</h4>
                      <p className="text-slate-300">Cliquez sur le bouton <strong>"+ Nouvelle Tâche"</strong> en haut ou utilisez le raccourci <kbd className="px-2 py-0.5 rounded bg-white/15 text-white font-mono text-[11px]">Ctrl + T</kbd>. Vous pouvez renseigner un titre, une description, des sous-tâches, une catégorie, des étiquettes et joindre des captures d'écran.</p>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'projects' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <FolderPlus className="w-5 h-5 text-[#FF9500]" />
                      <span>Gestion des Espaces & Dossiers de Projets</span>
                    </h3>
                    <p className="text-slate-300">
                      Organisez vos tableaux par dossiers (ex: "Développement Web", "Stratégie Marketing", "Personnel").
                    </p>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white">Glisser-Déposer à la souris :</h4>
                      <p className="text-slate-300">Dans le volet latéral, saisissez n'importe quel document à la souris pour le réordonner au-dessus ou en-dessous d'un autre document, ou glissez-le directement sur l'en-tête d'un dossier.</p>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'team' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Users className="w-5 h-5 text-[#34C759]" />
                      <span>Sessions d'Équipe & Comptes Google Authentifiés</span>
                    </h3>
                    <p className="text-slate-300">
                      Partagez des tableaux de tâches avec vos collègues en associant leurs vrais comptes Google.
                    </p>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white">Créer ou Rejoindre une session d'équipe :</h4>
                      <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
                        <li>Dans le volet latéral sous <strong>"Équipes & Documents Partagés"</strong>, cliquez sur <strong>"+ Créer une équipe"</strong> ou <strong>"🔑 Rejoindre par code"</strong>.</li>
                        <li>Connectez-vous à votre compte Google pour authentifier votre profil membre.</li>
                        <li>Transmettez le code de session généré (ex: <code>TF-XXXX</code>) à vos collaborateurs.</li>
                        <li>Chaque membre connecté apparaît avec son profil Google (nom, photo et email).</li>
                      </ol>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'themes' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>Thème Liquid Glass (iOS 27), Modes & Tâches Illimitées</span>
                    </h3>
                    <p className="text-slate-300">
                      Basculez en 1 clic entre le thème futuriste <strong> Liquid Glass (iOS 27)</strong>, le <strong>Mode Clair</strong>, le <strong>Mode Sombre</strong> ou l'adaptation automatique au système d'exploitation.
                    </p>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-black/40 border border-cyan-400/30 space-y-2">
                      <h4 className="font-semibold text-white flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                        <span>Esthétique Liquid Glass (iOS 27) :</span>
                      </h4>
                      <p className="text-slate-300">
                        Inspiré par le design Apple iOS 27, ce thème applique un flou optique dynamique à haute saturation, des reflets spéculaires et une translucidité multicouche sur chaque colonne et carte de tâche.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <h4 className="font-semibold text-white flex items-center space-x-2">
                        <span className="text-[#007AFF] font-bold text-base">∞</span>
                        <span>Capacité Illimitée par Colonne :</span>
                      </h4>
                      <p className="text-slate-300">
                        Chaque colonne accueille une infinité de tâches sans aucune limite. Le défilement fluide et le bouton d'ajout rapide épinglé en en-tête permettent de gérer des centaines de tâches avec une totale fluidité.
                      </p>
                    </div>
                  </div>
                )}

                {activeWikiTopic === 'export' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <HardDrive className="w-5 h-5 text-[#007AFF]" />
                      <span>Exportation, Importation `.taskflow` & Vidage de Cache</span>
                    </h3>
                    <p className="text-slate-300">
                      Sauvegardez vos documents sous forme de fichier local <code>.taskflow</code> à tout moment ou videz le cache d'application dans les Paramètres &gt; Stockage.
                    </p>
                  </div>
                )}

                {activeWikiTopic === 'download' && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Download className="w-5 h-5 text-[#34C759]" />
                      <span>Installation de l'Application Bureau Windows (.exe)</span>
                    </h3>
                    <p className="text-slate-300">
                      L'application de bureau Windows est générée avec Electron et NSIS.
                    </p>
                    <button
                      onClick={handleDownloadExe}
                      className="px-6 py-3 bg-[#34C759] hover:bg-[#2fb34f] text-white font-semibold rounded-full flex items-center space-x-2 apple-btn-active cursor-pointer"
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
      <footer className="bg-black/90 border-t border-white/10 px-6 py-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <div className="flex items-center space-x-2">
          <TaskFlowLogo size={24} showText={true} />
        </div>
        <p>© 2026 TaskFlow — Apple Design System Edition.</p>
        <button onClick={onLaunchApp} className="text-[#007AFF] hover:underline font-semibold cursor-pointer">
          Accéder à l'application Web →
        </button>
      </footer>
    </div>
  );
};
