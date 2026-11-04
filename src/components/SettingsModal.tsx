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
  ExternalLink
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

interface SettingsModalProps {
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

interface UpdaterStatusState {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  error?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenAuthModal }) => {
  const { user, syncStatus } = useTaskContext();
  const [appVersion, setAppVersion] = useState('1.0.1');
  const [updaterState, setUpdaterState] = useState<UpdaterStatusState>({ status: 'idle' });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Get app version if in Electron
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then((ver) => {
        if (ver) setAppVersion(ver);
      }).catch(() => {});
    }

    // Listen for updater status
    if (window.electronAPI?.onUpdaterStatus) {
      const unsub = window.electronAPI.onUpdaterStatus((data) => {
        setUpdaterState(data);
        if (data.status !== 'checking') {
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
      // In web preview fallback
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#161a27] border border-white/15 rounded-xl shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#1e2334] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-blue-600/20 text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Paramètres & Mises à jour
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Section: Mise à jour automatique */}
          <div className="bg-[#1e2334] rounded-xl border border-white/10 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <span>Mises à jour du logiciel</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    v{appVersion}
                  </span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Vérifiez directement les nouvelles versions publiées sur GitHub sans devoir relancer l'application.
                </p>
              </div>
            </div>

            {/* Status Feedback Box */}
            <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-2">
              {updaterState.status === 'idle' && (
                <div className="flex items-center space-x-2 text-slate-400">
                  <ArrowUpCircle className="w-4 h-4 text-slate-400" />
                  <span>Version actuelle installée : <strong className="text-white">v{appVersion}</strong></span>
                </div>
              )}

              {updaterState.status === 'checking' && (
                <div className="flex items-center space-x-2 text-blue-400 animate-pulse">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Recherche de mise à jour auprès de GitHub...</span>
                </div>
              )}

              {updaterState.status === 'not-available' && (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Votre application est à jour ! Vous utilisez la version la plus récente (v{updaterState.version || appVersion}).</span>
                </div>
              )}

              {updaterState.status === 'available' && (
                <div className="flex items-center space-x-2 text-cyan-400">
                  <ArrowUpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Nouvelle version <strong>v{updaterState.version || ''}</strong> trouvée ! Démarrage du téléchargement...</span>
                </div>
              )}

              {updaterState.status === 'downloading' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-blue-400 text-[11px]">
                    <span className="flex items-center space-x-1.5">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Téléchargement de la mise à jour...</span>
                    </span>
                    <span className="font-mono font-bold">{updaterState.percent || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
                      style={{ width: `${updaterState.percent || 0}%` }}
                    />
                  </div>
                </div>
              )}

              {updaterState.status === 'downloaded' && (
                <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg space-y-2 text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Mise à jour v{updaterState.version || ''} prête !</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Le fichier a été téléchargé avec succès. Vous pouvez l'installer dès maintenant sans perdre vos données.
                  </p>
                </div>
              )}

              {updaterState.status === 'error' && (
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{updaterState.error || 'Impossible de vérifier les mises à jour.'}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCheckForUpdates}
                disabled={isChecking || updaterState.status === 'downloading'}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-blue-600/30 active:scale-[0.99]"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Recherche en cours...' : 'Rechercher une mise à jour'}</span>
              </button>

              {updaterState.status === 'downloaded' && (
                <button
                  onClick={handleInstallNow}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Redémarrer et Installer</span>
                </button>
              )}
            </div>
          </div>

          {/* Section: Synchronisation Cloud & Compte */}
          <div className="bg-[#1e2334] rounded-xl border border-white/10 p-4 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>Synchronisation & Données</span>
            </h4>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
              <div>
                <span className="font-medium text-slate-200 block">
                  {user ? 'Compte Cloud synchronisé' : 'Stockage local actif'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {user ? user.email : 'Vos données sont stockées sur votre ordinateur (.taskflow).'}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal?.();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
              >
                {user ? 'Gérer mon compte' : 'Se connecter'}
              </button>
            </div>
          </div>

          {/* Section: Interface & Raccourcis */}
          <div className="bg-[#1e2334] rounded-xl border border-white/10 p-4 space-y-2.5">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span>Interface & Système</span>
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Design</span>
                <span className="text-white font-medium">Windows 11 Fluent Dark</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Canal de mise à jour</span>
                <span className="text-white font-medium">GitHub Releases (Auto-Updater)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Format de documents</span>
                <span className="text-white font-medium">Fichiers .taskflow</span>
              </div>
              <div className="flex items-center justify-between py-1 pt-1.5">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Version Web (GitHub Pages)</span>
                </span>
                <a
                  href="https://romanf888.github.io/TaskFlow/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 hover:underline"
                >
                  <span>romanf888.github.io/TaskFlow</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#1e2334] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">TaskFlow Windows v{appVersion}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
