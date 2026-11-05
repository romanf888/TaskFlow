import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  Key, 
  Copy, 
  Check, 
  LogOut, 
  ShieldCheck, 
  FolderPlus,
  Sparkles
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';

interface TeamModalProps {
  onClose: () => void;
  initialMode?: 'create' | 'join' | 'manage';
  targetSessionCode?: string;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  onClose,
  initialMode = 'create',
  targetSessionCode,
}) => {
  const { 
    user, 
    teamSessions, 
    createTeamSession, 
    joinTeamSession, 
    leaveTeamSession,
    createBoard
  } = useTaskContext();
  const { effectiveTheme } = useSettings();
  const isLight = effectiveTheme === 'light';

  const [mode, setMode] = useState<'create' | 'join' | 'manage'>(
    targetSessionCode ? 'manage' : initialMode
  );

  // Forms
  const [teamName, setTeamName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState(targetSessionCode || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected session for manage mode
  const selectedSession = teamSessions.find(s => s.code === (targetSessionCode || joinCodeInput)) || teamSessions[0];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!teamName.trim()) {
      setErrorMsg('Veuillez entrer un nom pour l’équipe.');
      return;
    }
    try {
      const newCode = await createTeamSession(teamName.trim());
      setJoinCodeInput(newCode);
      setMode('manage');
    } catch (err: any) {
      setErrorMsg('Erreur lors de la création de la session d’équipe.');
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Veuillez entrer un code de session valide (ex: TF-7892).');
      return;
    }
    const success = await joinTeamSession(cleanCode);
    if (success) {
      setMode('manage');
    } else {
      setErrorMsg(`Code de session "${cleanCode}" introuvable ou invalide.`);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#1e1f20] border-white/15 text-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#191a1b] border-white/10'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4285F4]/20 text-[#4285F4] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Session d'Équipe & Collaboration
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Partagez des tableaux de tâches en temps réel avec un code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Navigation Tabs */}
        <div className={`flex border-b px-6 pt-3 gap-3 ${
          isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/10 bg-[#191a1b]/50'
        }`}>
          <button
            onClick={() => { setMode('create'); setErrorMsg(null); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              mode === 'create'
                ? 'border-[#4285F4] text-[#4285F4]'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer une équipe</span>
          </button>

          <button
            onClick={() => { setMode('join'); setErrorMsg(null); }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              mode === 'join'
                ? 'border-[#4285F4] text-[#4285F4]'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Rejoindre par code</span>
          </button>

          {teamSessions.length > 0 && (
            <button
              onClick={() => { setMode('manage'); setErrorMsg(null); }}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                mode === 'manage'
                  ? 'border-[#4285F4] text-[#4285F4]'
                  : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mes Équipes ({teamSessions.length})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-500 flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="font-bold underline ml-2">Ignorer</button>
            </div>
          )}

          {/* Mode 1: Create Team Session */}
          {mode === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Nom du groupe ou de l'équipe :
                </label>
                <input
                  type="text"
                  placeholder="Ex: Équipe UEFN, Sprint Marketing..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-[#4285F4] ${
                    isLight 
                      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400' 
                      : 'bg-[#282a2d] border-white/15 text-white placeholder:text-slate-500'
                  }`}
                  autoFocus
                />
              </div>

              <div className={`p-3 rounded-2xl border text-[11.5px] leading-relaxed space-y-1 ${
                isLight ? 'bg-blue-50/60 border-blue-200 text-blue-900' : 'bg-[#4285F4]/10 border-[#4285F4]/30 text-blue-200'
              }`}>
                <div className="font-semibold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>Un code unique sera généré (ex: TF-8942)</span>
                </div>
                <p className="opacity-90">
                  Transmettez ce code à vos collègues pour qu'ils rejoignent l'équipe et visualisent vos tableaux de tâches partagés en direct.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold rounded-xl text-xs shadow-md shadow-[#4285F4]/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer la session</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode 2: Join Team Session by Code */}
          {mode === 'join' && (
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Code de session d'équipe :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: TF-8492"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider uppercase outline-none focus:ring-2 focus:ring-[#4285F4] ${
                      isLight 
                        ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400' 
                        : 'bg-[#282a2d] border-white/15 text-white placeholder:text-slate-500'
                    }`}
                    autoFocus
                  />
                  <Key className="w-4 h-4 absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className={`p-3 rounded-2xl border text-[11.5px] leading-relaxed ${
                isLight ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}>
                Entrez le code fourni par le créateur de la session pour rejoindre le groupe et afficher ses documents partagés.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#34A853] hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-[#34A853]/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Key className="w-4 h-4" />
                  <span>Rejoindre l'équipe</span>
                </button>
              </div>
            </form>
          )}

          {/* Mode 3: Manage Joined Team Sessions & Members */}
          {mode === 'manage' && selectedSession && (
            <div className="space-y-4">
              {/* Active Session Card */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#282a2d] border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4]">Session active</span>
                    <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedSession.name}
                    </h4>
                  </div>

                  {/* Code Badge & Copy */}
                  <div className="flex items-center space-x-1.5">
                    <div className="px-3 py-1 bg-[#4285F4]/20 border border-[#4285F4]/40 rounded-xl text-xs font-mono font-bold text-[#4285F4]">
                      {selectedSession.code}
                    </div>
                    <button
                      onClick={() => handleCopyCode(selectedSession.code)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        copiedCode 
                          ? 'bg-[#34A853] text-white border-transparent' 
                          : isLight ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700' : 'bg-black/30 border-white/15 hover:bg-white/10 text-slate-200'
                      }`}
                      title="Copier le code de session"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Membres de l'équipe ({selectedSession.members?.length || 1}) :</span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>En direct</span>
                    </span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {selectedSession.members?.map((mem) => (
                      <div
                        key={mem.id}
                        className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs ${
                          isLight ? 'bg-white border-slate-200' : 'bg-black/20 border-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                            style={{ backgroundColor: mem.avatarColor || '#4285F4' }}
                          >
                            {mem.name[0].toUpperCase()}
                          </div>
                          <span className="truncate font-medium">{mem.name}</span>
                          {mem.id === selectedSession.creatorId && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-[#FBBC04]/20 text-[#FBBC04] rounded-full font-bold">
                              Créateur
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Rôle: Éditeur</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add Team Document / Leave Session */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    const docTitle = prompt(`Nouveau document pour l'équipe "${selectedSession.name}" :`, `Tableau ${selectedSession.name}`);
                    if (docTitle && docTitle.trim()) {
                      createBoard(docTitle.trim(), `Document d'équipe`, 'briefcase', '#4285F4', selectedSession.name, selectedSession.code);
                      onClose();
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-[#282a2d] hover:bg-[#323639] border-white/10 text-white'
                  }`}
                >
                  <FolderPlus className="w-4 h-4 text-[#4285F4]" />
                  <span>+ Document d'équipe</span>
                </button>

                <button
                  onClick={async () => {
                    if (confirm(`Quitter l'équipe "${selectedSession.name}" ? Vous ne verrez plus ses documents partagés sur cet appareil.`)) {
                      await leaveTeamSession(selectedSession.code);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5"
                  title="Quitter cette session d'équipe"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Quitter l'équipe</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
