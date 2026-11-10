import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  CheckCircle2, 
  RotateCw, 
  X, 
  Sparkles,
  ArrowUpCircle,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { TaskFlowLogo } from './TaskFlowLogo';

export interface UpdaterStatusPayload {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  releaseDate?: string;
  releaseNotes?: string;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  error?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      checkForUpdates: () => Promise<any>;
      startDownloadUpdate?: () => Promise<any>;
      quitAndInstallUpdate: () => Promise<void>;
      getAppVersion: () => Promise<string>;
      openExternalBrowserAuth?: () => Promise<boolean>;
      openExternalUrl?: (url: string) => Promise<boolean>;
      clearAppCache?: () => Promise<any>;
      minimizeWindow?: () => void;
      maximizeWindow?: () => void;
      closeWindow?: () => void;
      isMaximized?: () => Promise<boolean>;
      onUpdaterStatus?: (callback: (data: UpdaterStatusPayload) => void) => () => void;
      onGoogleAuthCredential?: (callback: (data: any) => void) => () => void;
    };
  }
}

export const UpdateNotification: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdaterStatusPayload | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStartingDownload, setIsStartingDownload] = useState(false);

  useEffect(() => {
    // 1. Electron updater event listener
    if (window.electronAPI?.onUpdaterStatus) {
      const unsubscribe = window.electronAPI.onUpdaterStatus((data) => {
        setUpdateInfo(data);
        if (data.status === 'available') {
          setIsDismissed(false);
          setIsMinimized(false);
          setIsStartingDownload(false);
        } else if (data.status === 'downloading') {
          setIsStartingDownload(false);
        } else if (data.status === 'downloaded') {
          setIsDismissed(false);
          setIsMinimized(false);
        }
      });
      return () => unsubscribe();
    }

    // 2. Custom event listener for manual testing in browser / dev mode
    const handleTestUpdate = (e: any) => {
      const detail = e.detail || {
        status: 'available',
        version: '1.5.1',
        releaseDate: new Date().toISOString(),
      };
      setUpdateInfo(detail);
      setIsDismissed(false);
      setIsMinimized(false);
    };

    window.addEventListener('taskflow-show-update-popup', handleTestUpdate);
    return () => window.removeEventListener('taskflow-show-update-popup', handleTestUpdate);
  }, []);

  const handleStartDownload = async () => {
    setIsStartingDownload(true);
    if (window.electronAPI?.startDownloadUpdate) {
      try {
        await window.electronAPI.startDownloadUpdate();
      } catch (err) {
        console.warn('Failed to start update download:', err);
        setIsStartingDownload(false);
      }
    } else {
      // Browser simulation
      setUpdateInfo((prev) => ({ ...prev, status: 'downloading', percent: 15 }));
      let p = 15;
      const interval = setInterval(() => {
        p += 25;
        if (p >= 100) {
          clearInterval(interval);
          setUpdateInfo((prev) => ({ ...prev, status: 'downloaded', percent: 100 }));
        } else {
          setUpdateInfo((prev) => ({ ...prev, status: 'downloading', percent: p }));
        }
      }, 700);
    }
  };

  const handleInstallNow = () => {
    if (window.electronAPI?.quitAndInstallUpdate) {
      window.electronAPI.quitAndInstallUpdate();
    } else {
      alert('Simulation: Redémarrage et installation de la mise à jour.');
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!updateInfo || isDismissed) {
    return null;
  }

  // Ignore checking or up-to-date statuses
  if (updateInfo.status === 'checking' || updateInfo.status === 'not-available' || updateInfo.status === 'error') {
    return null;
  }

  // Minimized floating pill (when user clicks "Réduire en arrière-plan")
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-12 right-6 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#131b2f]/90 border border-cyan-400/40 shadow-2xl backdrop-blur-xl text-xs font-semibold text-white cursor-pointer hover:scale-105 active:scale-95 transition-all animate-in slide-in-from-bottom-3"
      >
        {updateInfo.status === 'downloading' ? (
          <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
        ) : updateInfo.status === 'downloaded' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <Sparkles className="w-4 h-4 text-cyan-400" />
        )}
        <span>
          {updateInfo.status === 'downloading'
            ? `Téléchargement (${updateInfo.percent || 0}%)`
            : updateInfo.status === 'downloaded'
            ? 'Mise à jour prête !'
            : 'Mise à jour disponible'}
        </span>
      </div>
    );
  }

  // Prominent Modal Popup
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={handleDismiss}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="apple-liquid-glass bg-[#111728]/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full text-slate-100 relative overflow-hidden"
      >
        {/* Top Specular Edge Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-cyan-500/15 blur-[60px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#007AFF]/15 blur-[60px] pointer-events-none rounded-full" />

        {/* Header with App Logo and Close Cross */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-inner">
              <TaskFlowLogo size={32} showText={false} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  TaskFlow Update
                </span>
                {updateInfo.version && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-[10px] font-mono font-bold text-cyan-300">
                    v{updateInfo.version}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight mt-0.5">
                {updateInfo.status === 'available' && 'Mise à jour logicielle disponible'}
                {updateInfo.status === 'downloading' && 'Téléchargement de la mise à jour'}
                {updateInfo.status === 'downloaded' && 'Mise à jour prête à être installée'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 relative z-10 text-xs">
          {updateInfo.status === 'available' && (
            <>
              <p className="text-slate-300 leading-relaxed">
                Une nouvelle version de <strong>TaskFlow</strong> est prête pour votre application.
                Elle apporte des améliorations de performances, de nouvelles options visuelles et des corrections.
              </p>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-1.5">
                <div className="flex items-center space-x-2 text-white font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Installation sous votre contrôle</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Les mises à jour ne s'installent plus automatiquement à votre insu. Vous pouvez lancer le téléchargement maintenant ou reporter à plus tard.
                </p>
              </div>

              {/* Action Buttons: Télécharger et Installer OU Plus tard */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer text-center apple-btn-active"
                >
                  <span className="flex items-center justify-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mettre à jour plus tard</span>
                  </span>
                </button>

                <button
                  onClick={handleStartDownload}
                  disabled={isStartingDownload}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white font-semibold text-xs shadow-lg shadow-[#007AFF]/35 transition-all cursor-pointer text-center apple-btn-active flex items-center justify-center space-x-1.5"
                >
                  {isStartingDownload ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Préparation...</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      <span>Télécharger et Installer</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {updateInfo.status === 'downloading' && (
            <>
              <p className="text-slate-300 leading-relaxed">
                Téléchargement du fichier d'installation en cours... Vous pouvez continuer à utiliser votre tableau de tâches.
              </p>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-cyan-300 flex items-center space-x-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Téléchargement des paquets...</span>
                  </span>
                  <span className="font-mono text-white text-sm">{updateInfo.percent || 0}%</span>
                </div>

                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-[#007AFF] via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${updateInfo.percent || 0}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="py-2 px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Continuer en arrière-plan
                </button>
              </div>
            </>
          )}

          {updateInfo.status === 'downloaded' && (
            <>
              <p className="text-slate-300 leading-relaxed">
                La mise à jour vers <strong>v{updateInfo.version || 'récente'}</strong> a été téléchargée avec succès.
                L'application doit redémarrer pour appliquer la nouvelle version.
              </p>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="text-[11px] font-medium leading-tight">
                  Toutes vos données et tableaux locaux seront préservés lors de la mise à jour.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer text-center apple-btn-active"
                >
                  Installer plus tard
                </button>

                <button
                  onClick={handleInstallNow}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#34C759] hover:bg-[#2fb34f] text-white font-semibold text-xs shadow-lg shadow-[#34C759]/35 transition-all cursor-pointer text-center apple-btn-active flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Redémarrer et Installer</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
