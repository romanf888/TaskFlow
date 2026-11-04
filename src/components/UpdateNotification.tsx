import React, { useState, useEffect } from 'react';
import { DownloadCloud, CheckCircle2, RotateCw, X, ArrowUpCircle } from 'lucide-react';

interface UpdaterStatusPayload {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  error?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      checkForUpdates: () => Promise<any>;
      quitAndInstallUpdate: () => Promise<void>;
      getAppVersion: () => Promise<string>;
      openExternalBrowserAuth?: () => Promise<boolean>;
      onUpdaterStatus?: (callback: (data: UpdaterStatusPayload) => void) => () => void;
      onGoogleAuthCredential?: (callback: (data: any) => void) => () => void;
    };
  }
}

export const UpdateNotification: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdaterStatusPayload | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.onUpdaterStatus) return;

    const unsubscribe = window.electronAPI.onUpdaterStatus((data) => {
      setUpdateInfo(data);
      if (data.status === 'available' || data.status === 'downloading' || data.status === 'downloaded') {
        setIsDismissed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!updateInfo || isDismissed) return null;

  // Don't show persistent banner if checking or no update
  if (updateInfo.status === 'checking' || updateInfo.status === 'not-available') return null;

  return (
    <div className="fixed bottom-10 right-5 z-50 max-w-sm bg-[#161a2b] border border-blue-500/40 rounded-xl shadow-2xl p-4 text-xs text-slate-200 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
            {updateInfo.status === 'downloaded' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : updateInfo.status === 'downloading' ? (
              <RotateCw className="w-5 h-5 text-blue-400 animate-spin" />
            ) : (
              <ArrowUpCircle className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              {updateInfo.status === 'downloaded' 
                ? 'Mise à jour prête !' 
                : updateInfo.status === 'downloading'
                ? `Téléchargement (${updateInfo.percent || 0}%)`
                : 'Mise à jour détectée'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {updateInfo.status === 'downloaded'
                ? `La version ${updateInfo.version || ''} a été téléchargée depuis GitHub.`
                : updateInfo.status === 'downloading'
                ? 'Téléchargement de la nouvelle version en arrière-plan...'
                : `Une nouvelle version (${updateInfo.version || ''}) est disponible.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar during download */}
      {updateInfo.status === 'downloading' && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${updateInfo.percent || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Install Button when ready */}
      {updateInfo.status === 'downloaded' && (
        <div className="mt-3 flex items-center justify-end space-x-2">
          <button
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg text-xs"
          >
            Plus tard
          </button>
          <button
            onClick={() => window.electronAPI?.quitAndInstallUpdate()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Redémarrer et Installer</span>
          </button>
        </div>
      )}
    </div>
  );
};
