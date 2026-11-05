import React from 'react';
import { X, Sparkles, Layers, Cloud, Globe, Keyboard, ExternalLink, CheckCircle2 } from 'lucide-react';
import { TaskFlowLogo } from './TaskFlowLogo';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1e1f20] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#191a1b] border-b border-white/10 flex items-center justify-between">
          <TaskFlowLogo size={32} showText={true} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Banner */}
          <div className="flex items-center space-x-3.5 p-3.5 bg-[#282a2d] rounded-2xl border border-white/10">
            <TaskFlowLogo size={36} showText={false} />
            <div>
              <h4 className="font-bold text-white text-sm">TaskFlow</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Gestionnaire de tâches moderne avec interface inspirée du design Google Material You, synchronisation cloud en direct et multi-projets.
              </p>
            </div>
          </div>

          {/* Points forts */}
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-200">Fonctionnalités clés :</h5>
            <div className="space-y-2 text-slate-300 bg-[#282a2d]/60 p-3.5 rounded-2xl border border-white/5">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#FBBC04] shrink-0 mt-0.5" />
                <span><strong>3 Colonnes fluides :</strong> ("À faire", "En cours", "Fait") avec glisser-déposer intuitif à la souris.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#4285F4] shrink-0 mt-0.5" />
                <span><strong>Style Google Material You :</strong> Bords ultra-arrondis, barre de recherche en pilule, et thème sombre doux.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
                <span><strong>Multi-appareils & Cloud :</strong> Synchronisation temps réel automatique via Firebase Firestore avec votre compte Google.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#EA4335] shrink-0 mt-0.5" />
                <span><strong>Multi-projets (.taskflow) :</strong> Gestion de plusieurs documents séparés pour scinder projets pro et personnels.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#8ab4f8] shrink-0 mt-0.5" />
                <span><strong>Déploiement simultané :</strong> Disponible en application de bureau Windows (.exe) et en version Web complète (GitHub Pages).</span>
              </div>
            </div>
          </div>

          {/* Raccourcis clavier */}
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Keyboard className="w-4 h-4 text-[#8ab4f8]" />
              <span>Raccourcis clavier pratiques</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#282a2d] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Nouvelle tâche</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 font-mono text-white text-[10px]">Ctrl + T</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#282a2d] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Nouveau document</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 font-mono text-white text-[10px]">Ctrl + N</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#282a2d] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Sauvegarder</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 font-mono text-white text-[10px]">Ctrl + S</kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#282a2d] border border-white/5 flex justify-between items-center">
                <span className="text-slate-400">Fermer la boîte</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 font-mono text-white text-[10px]">Échap</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#191a1b] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">TaskFlow</span>
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
