import React, { useState, useEffect } from 'react';
import { Minus, Square, Maximize2, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const WindowsWindowControls: React.FC = () => {
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
  const { effectiveTheme } = useSettings();
  const isLight = effectiveTheme === 'light';
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    const checkMaximized = async () => {
      try {
        if ((window as any).electronAPI?.isMaximized) {
          const maxed = await (window as any).electronAPI.isMaximized();
          setIsMaximized(maxed);
        }
      } catch (e) {}
    };
    checkMaximized();
  }, [isElectron]);

  if (!isElectron) return null;

  const handleMinimize = () => {
    if ((window as any).electronAPI?.minimizeWindow) {
      (window as any).electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if ((window as any).electronAPI?.maximizeWindow) {
      const res = await (window as any).electronAPI.maximizeWindow();
      if (res !== undefined) setIsMaximized(res);
      else setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI?.closeWindow) {
      (window as any).electronAPI.closeWindow();
    }
  };

  return (
    <div 
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      className="flex items-center space-x-1 shrink-0 ml-2 pl-2 border-l border-black/10 dark:border-white/15 h-8 z-50 select-none"
    >
      <button
        onClick={handleMinimize}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-black/10' : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        title="Réduire"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleMaximize}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
          isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-black/10' : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        title={isMaximized ? "Restaurer" : "Agrandir"}
      >
        {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3 h-3" />}
      </button>
      <button
        onClick={handleClose}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#EA4335] rounded-lg transition-colors cursor-pointer"
        title="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
