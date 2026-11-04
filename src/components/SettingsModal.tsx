import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  DownloadCloud, 
  ArrowUpCircle, 
  AlertCircle, 
  Settings, 
  Sparkles, 
  HardDrive, 
  Cloud, 
  Monitor, 
  ShieldCheck,
  Globe,
  ExternalLink,
  Palette,
  Sliders,
  Database,
  Check,
  Layers,
  Eye,
  CheckSquare
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useSettings, THEME_COLOR_MAP, ThemeColor, BorderRadiusStyle, DisplayDensity, DefaultSort, SurfaceTheme } from '../context/SettingsContext';
import { TaskFlowLogo } from './TaskFlowLogo';

interface SettingsModalProps {
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

interface UpdaterStatusState {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  releaseDate?: string;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  error?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  onOpenAuthModal 
}) => {
  const { user, syncStatus, lastSyncTime, boards, allTasks, saveCurrentDocument, exportBoardToFile, activeBoardId } = useTaskContext();
  const { preferences, updatePreference, resetPreferences, accentColorHex, getRoundedClass } = useSettings();

  const [activeTab, setActiveTab] = useState<'appearance' | 'tasks' | 'sync' | 'updates'>('appearance');
  const [appVersion, setAppVersion] = useState('1.0.6');
  const [updaterState, setUpdaterState] = useState<UpdaterStatusState>({ status: 'idle' });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then((v) => {
        if (v) setAppVersion(v);
      });
    }

    if (window.electronAPI?.onUpdaterStatus) {
      const unsub = window.electronAPI.onUpdaterStatus((data: UpdaterStatusState) => {
        setUpdaterState(data);
        if (data.status === 'not-available' || data.status === 'error' || data.status === 'downloaded') {
          setIsChecking(false);
        }
      });
      return () => unsub();
    }
  }, []);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    setUpdaterState({ status: 'checking' });

    if (window.electronAPI?.checkForUpdates) {
      try {
        const result = await window.electronAPI.checkForUpdates();
        if (result?.status === 'dev-mode') {
          setTimeout(() => {
            setIsChecking(false);
            setUpdaterState({
              status: 'not-available',
              version: appVersion,
            });
          }, 1000);
        }
      } catch (err: any) {
        setIsChecking(false);
        setUpdaterState({
          status: 'error',
          error: err?.message || 'Erreur lors de la vérification.',
        });
      }
    } else {
      setTimeout(() => {
        setIsChecking(false);
        setUpdaterState({
          status: 'not-available',
          version: appVersion,
        });
      }, 1200);
    }
  };

  const handleInstallNow = () => {
    if (window.electronAPI?.quitAndInstallUpdate) {
      window.electronAPI.quitAndInstallUpdate();
    }
  };

  const modalRounded = getRoundedClass('modal');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl bg-[#1e1f20] border border-white/15 ${modalRounded} shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Google TaskFlow branding */}
        <div className="px-6 py-4 bg-[#191a1b] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TaskFlowLogo size={28} showText={false} />
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Paramètres TaskFlow
              </h3>
              <p className="text-[11px] text-slate-400">
                Personnalisez votre interface Google Workspace & synchronisation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-6 pt-3 pb-2 border-b border-white/10 flex gap-2 overflow-x-auto bg-[#191a1b]/50">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Apparence & Style</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tâches & Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Compte & Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'updates'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Mises à jour & Liens</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: APPEARANCE & GOOGLE STYLE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Couleur d'accentuation Google */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="font-semibold text-white text-sm block">Couleur d'accentuation Google</span>
                <p className="text-[11px] text-slate-400">
                  Choisissez la teinte principale appliquée aux boutons, sélecteurs et indicateurs :
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {(Object.keys(THEME_COLOR_MAP) as ThemeColor[]).map((cKey) => {
                    const cInfo = THEME_COLOR_MAP[cKey];
                    const isSelected = preferences.themeColor === cKey;
                    return (
                      <button
                        key={cKey}
                        onClick={() => updatePreference('themeColor', cKey)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-white/10 font-bold shadow-sm'
                            : 'border-white/10 hover:border-white/20 bg-black/20'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: cInfo.hex }}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </span>
                        <span className="text-[10px] text-slate-300">{cInfo.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style des coins arrondis */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="font-semibold text-white text-sm block">Arrondi des bordures (Material You)</span>
                <p className="text-[11px] text-slate-400">
                  Ajustez la rondeur des cartes, boîtes de dialogue et conteneurs :
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'extra', label: 'Ultra arrondi (24px)', desc: 'Style Google Material You' },
                    { id: 'standard', label: 'Standard (16px)', desc: 'Style Workspace classique' },
                    { id: 'minimal', label: 'Léger (8px)', desc: 'Coins subtilement adoucis' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => updatePreference('borderRadius', item.id as BorderRadiusStyle)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        preferences.borderRadius === item.id
                          ? 'border-[#4285F4] bg-[#4285F4]/15 font-semibold text-white'
                          : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-300'
                      }`}
                    >
                      <span className="block text-xs">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Densité d'affichage */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="font-semibold text-white text-sm block">Densité d'affichage</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updatePreference('density', 'comfortable')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      preferences.density === 'comfortable'
                        ? 'border-[#4285F4] bg-[#4285F4]/15 font-semibold text-white'
                        : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-300'
                    }`}
                  >
                    <span className="block text-xs">Confortable</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Plus d'espace, descriptions et détails visibles</span>
                  </button>
                  <button
                    onClick={() => updatePreference('density', 'compact')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      preferences.density === 'compact'
                        ? 'border-[#4285F4] bg-[#4285F4]/15 font-semibold text-white'
                        : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-300'
                    }`}
                  >
                    <span className="block text-xs">Compacte</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Cartes resserrées pour voir un maximum de tâches</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & KANBAN BEHAVIOR */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="font-semibold text-white text-sm block">Automatisation des Tâches</span>
                
                {/* Auto-move to Done */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-medium text-white block">Déplacement automatique vers "Fait"</span>
                    <span className="text-[11px] text-slate-400">
                      Quand vous cochez toutes les sous-tâches d'une carte, la déplacer automatiquement dans la colonne "Fait".
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.autoMoveDoneTasks}
                    onChange={(e) => updatePreference('autoMoveDoneTasks', e.target.checked)}
                    className="w-4 h-4 accent-[#4285F4] rounded cursor-pointer shrink-0"
                  />
                </label>

                {/* Show thumbnails */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-medium text-white block">Miniatures d'illustrations sur les cartes</span>
                    <span className="text-[11px] text-slate-400">
                      Afficher l'aperçu de la capture d'écran directement dans le tableau Kanban.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.showImageThumbnails}
                    onChange={(e) => updatePreference('showImageThumbnails', e.target.checked)}
                    className="w-4 h-4 accent-[#4285F4] rounded cursor-pointer shrink-0"
                  />
                </label>

                {/* Show subtask progress bar */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div className="pr-4">
                    <span className="font-medium text-white block">Barre de progression des sous-tâches</span>
                    <span className="text-[11px] text-slate-400">
                      Affiche la jauge de progression colorée (0-100%) sur chaque carte.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.showSubtaskProgress}
                    onChange={(e) => updatePreference('showSubtaskProgress', e.target.checked)}
                    className="w-4 h-4 accent-[#4285F4] rounded cursor-pointer shrink-0"
                  />
                </label>
              </div>

              {/* Tri par défaut */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-2.5">
                <span className="font-semibold text-white text-sm block">Tri des colonnes</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'manual', label: 'Glisser-Déposer' },
                    { id: 'priority', label: 'Par priorité' },
                    { id: 'date-desc', label: 'Plus récentes' },
                    { id: 'date-asc', label: 'Plus anciennes' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updatePreference('defaultSort', s.id as DefaultSort)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                        preferences.defaultSort === s.id
                          ? 'border-[#4285F4] bg-[#4285F4]/15 font-semibold text-white'
                          : 'border-white/10 hover:border-white/20 bg-black/20 text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT & CLOUD */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#34A853]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-sm">
                        {user?.email ? user.email[0].toUpperCase() : 'G'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {user ? user.displayName || user.email : 'Utilisateur Local'}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {user ? user.email : 'Aucun compte Google connecté'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal?.();
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#4285F4] hover:bg-[#3367d6] text-white transition-colors cursor-pointer"
                  >
                    {user ? 'Gérer la session' : 'Se connecter'}
                  </button>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Statut de la base Firestore :</span>
                  <span className={`font-semibold flex items-center space-x-1 ${user ? 'text-[#34A853]' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{user ? 'Connectée & Synchronisée' : 'Mode hors-ligne local'}</span>
                  </span>
                </div>

                {lastSyncTime && (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dernière synchro réussie :</span>
                    <span className="text-slate-300 font-mono">{lastSyncTime.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              {/* Sauvegarde et export global */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <span className="font-semibold text-white text-sm block">Sauvegardes manuelles</span>
                <p className="text-[11px] text-slate-400">
                  Exportez une copie de sécurité de vos documents ou enregistrez le document courant sur votre disque.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      saveCurrentDocument();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center space-x-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enregistrer localement (Ctrl+S)</span>
                  </button>
                  <button
                    onClick={() => exportBoardToFile(activeBoardId)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center space-x-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <DownloadCloud className="w-3.5 h-3.5 text-[#8ab4f8]" />
                    <span>Exporter .taskflow</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPDATES & WEB ACCESS */}
          {activeTab === 'updates' && (
            <div className="space-y-4">
              {/* Updater status box */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                      <RotateCw className={`w-4 h-4 text-[#8ab4f8] ${isChecking ? 'animate-spin' : ''}`} />
                      <span>Mises à jour du logiciel</span>
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Version installée : <strong className="text-white">v{appVersion}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleCheckForUpdates}
                    disabled={isChecking}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#4285F4] hover:bg-[#3367d6] disabled:opacity-50 text-white transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    {isChecking ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Vérification...</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rechercher une mise à jour</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status Messages */}
                {updaterState.status === 'not-available' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Vous utilisez déjà la dernière version de TaskFlow (v{appVersion}).</span>
                  </div>
                )}

                {updaterState.status === 'downloading' && (
                  <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs text-blue-300 font-medium">
                      <span>Téléchargement de la mise à jour...</span>
                      <span>{updaterState.percent || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#4285F4] rounded-full transition-all duration-200"
                        style={{ width: `${updaterState.percent || 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {updaterState.status === 'downloaded' && (
                  <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-300">Mise à jour prête !</p>
                      <p className="text-[11px] text-slate-300">Redémarrez l'application pour appliquer les changements.</p>
                    </div>
                    <button
                      onClick={handleInstallNow}
                      className="px-3.5 py-1.5 bg-[#34A853] hover:bg-emerald-600 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Redémarrer et Installer
                    </button>
                  </div>
                )}
              </div>

              {/* Version Web GitHub Pages Banner */}
              <div className="bg-[#282a2d] p-4 rounded-2xl border border-white/10 space-y-2.5">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[#34A853]" />
                  <span>Version Web (GitHub Pages)</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Toutes les mises à jour de TaskFlow sont automatiquement publiées à la fois sur votre application Windows (.exe) et sur votre site web public :
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
                  <span className="font-mono text-slate-200 text-xs truncate">
                    https://romanf888.github.io/TaskFlow/
                  </span>
                  <a
                    href="https://romanf888.github.io/TaskFlow/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-[#34A853] hover:bg-emerald-600 text-white rounded-full text-xs font-medium flex items-center space-x-1 shrink-0 ml-2"
                  >
                    <span>Ouvrir</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#191a1b] border-t border-white/10 flex items-center justify-between">
          <button
            onClick={resetPreferences}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            Réinitialiser les préférences
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
