import React from 'react';
import { X, CheckSquare, Layers, Cloud, Sparkles, FileText, Keyboard } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171b28] border border-white/15 rounded-xl shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#1e2334] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              À propos de TaskFlow Windows
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          <div className="flex items-center space-x-3 p-3 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">TaskFlow pour Windows 11</h4>
              <p className="text-slate-400 text-xs">
                Gestionnaire de tâches moderne avec interface Fluent Design, mode sombre natif et glisser-déposer fluide.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-300">Conformité au cahier des charges :</h5>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside bg-black/20 p-3 rounded-lg border border-white/5">
              <li><strong>Tableau Kanban :</strong> Colonnes ciblées "À faire", "En cours", "Fait" sans calendrier encombrant.</li>
              <li><strong>Compte Google & Cloud :</strong> Synchronisation temps réel automatique multi-appareils via Firestore.</li>
              <li><strong>Mode Sombre :</strong> Thème Windows sombre élégant avec micro-animations de glisser-déposer.</li>
              <li><strong>Sous-tâches & Tags :</strong> Checklist interactive avec barre de progression et catégories personnalisées.</li>
              <li><strong>Détails & Illustrations :</strong> Menu détaillé complet, captures d'écran zoomables et crayon d'édition rapide en haut à droite.</li>
              <li><strong>Système de fichiers :</strong> Gestionnaire de plusieurs documents séparés (.taskflow) pour organiser vos projets pro et perso.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Raccourcis clavier pratiques :</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Nouvelle tâche</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-white">Ctrl+T</kbd>
              </div>
              <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Nouveau document</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-white">Ctrl+N</kbd>
              </div>
              <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Enregistrer</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-white">Ctrl+S</kbd>
              </div>
              <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                <span className="text-slate-400">Coller capture d'écran</span>
                <kbd className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-white">Ctrl+V</kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#1e2334] border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Version 1.0.0 - Windows Edition</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
