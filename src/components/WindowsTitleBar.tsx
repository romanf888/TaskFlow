import React, { useState } from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RotateCw, 
  HardDrive, 
  CheckSquare, 
  LogIn, 
  LogOut,
  Maximize2
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

interface WindowsTitleBarProps {
  onOpenAuthModal: () => void;
  onOpenDocManager: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({ 
  onOpenAuthModal, 
  onOpenDocManager 
}) => {
  const { 
    activeBoard, 
    user, 
    syncStatus, 
    signOut,
    notificationMessage 
  } = useTaskContext();

  const [isMaximized, setIsMaximized] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <header className="h-9 select-none bg-[#12151f] border-b border-white/10 flex items-center justify-between px-3 text-xs text-slate-300 relative z-30">
      {/* Left: App Icon & Document Title */}
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <div className="w-5 h-5 rounded bg-blue-600/80 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <CheckSquare className="w-3.5 h-3.5" />
        </div>
        
        <span className="font-semibold text-slate-100 tracking-wide text-xs">
          TaskFlow Windows
        </span>
        
        <span className="text-slate-500 text-[11px]">-</span>
        
        <button
          onClick={onOpenDocManager}
          className="truncate max-w-[240px] text-slate-300 hover:text-blue-400 font-medium transition-colors flex items-center space-x-1 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer"
          title="Gérer les documents et projets"
        >
          <span className="truncate">{activeBoard?.title || 'Sans titre'}</span>
          <span className="text-[10px] text-slate-500">.taskflow</span>
        </button>
      </div>

      {/* Center: Live Notification / Status Banner */}
      {notificationMessage && (
        <div className="hidden md:flex items-center space-x-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full text-[11px] animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="truncate max-w-[280px]">{notificationMessage}</span>
        </div>
      )}

      {/* Right: Cloud Sync Status & Windows Controls */}
      <div className="flex items-center space-x-3">
        {/* Cloud Sync Indicator */}
        <div className="relative">
          {user ? (
            <div 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
              title={`Connecté : ${user.email} (Synchronisation Cloud active)`}
            >
              {syncStatus === 'syncing' ? (
                <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : syncStatus === 'offline' ? (
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              
              <div className="flex items-center space-x-1">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Utilisateur'} 
                    className="w-4 h-4 rounded-full border border-emerald-400/50" 
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-[9px] text-white flex items-center justify-center font-bold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-[11px] text-slate-300 font-medium">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-all text-[11px]"
              title="Connectez un compte Google pour la synchronisation multi-appareils"
            >
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>Mode Local</span>
              <span className="text-blue-400 font-semibold flex items-center space-x-0.5">
                <Cloud className="w-3 h-3" />
                <span className="hidden sm:inline">Sync Google</span>
              </span>
            </button>
          )}

          {/* User popup dropdown */}
          {showUserDropdown && user && (
            <div className="absolute right-0 top-7 w-64 bg-[#1a1e2b] border border-white/15 rounded-lg shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 text-slate-200">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-blue-400" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs text-white truncate">{user.displayName || 'Utilisateur Google'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="pt-2 text-[11px] space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span className="flex items-center space-x-1">
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>Sync Cloud Google</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">Actif</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Toutes vos tâches sont synchronisées en continu sur vos ordinateurs, téléphones et tablettes connectés.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  signOut();
                }}
                className="mt-3 w-full flex items-center justify-center space-x-1.5 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>

        {/* Windows Standard Window Action Buttons */}
        <div className="flex items-center -mr-2">
          <button 
            className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Réduire"
            onClick={() => {}}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isMaximized ? "Niveau inférieur" : "Agrandir"}
            onClick={toggleMaximize}
          >
            {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3 h-3" />}
          </button>
          <button 
            className="w-10 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
            title="Fermer"
            onClick={() => {}}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
