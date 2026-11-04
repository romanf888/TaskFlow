import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  Laptop, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  LogOut, 
  HardDrive,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';

interface GoogleAuthModalProps {
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ onClose }) => {
  const { 
    user, 
    signInWithGoogle, 
    signInWithEmail, 
    registerWithEmail, 
    signOut 
  } = useTaskContext();

  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('romanferriere4@gmail.com');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('Roman Ferriere');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir votre email et mot de passe.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.message || 'Une erreur est survenue.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#161a27] border border-white/15 rounded-xl shadow-2xl overflow-hidden text-slate-200 my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#1e2334] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-blue-600/20 text-blue-400">
              <Cloud className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Synchronisation Cloud TaskFlow
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
        <div className="p-5 space-y-4 text-xs">
          {user ? (
            /* User already connected */
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full border border-emerald-400" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="truncate flex-1">
                  <h4 className="font-semibold text-white text-sm truncate">
                    {user.displayName || 'Compte Cloud'}
                  </h4>
                  <p className="text-slate-400 truncate">{user.email}</p>
                  <div className="flex items-center space-x-1 text-emerald-400 font-medium text-[11px] mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Synchronisation Cloud active en temps réel</span>
                  </div>
                </div>
              </div>

              {/* Multi-device sync status illustration */}
              <div className="bg-[#1e2334] p-3.5 rounded-lg border border-white/10 space-y-2">
                <span className="font-semibold text-slate-300 block">Appareils synchronisés :</span>
                <div className="flex items-center justify-around py-2 text-slate-400">
                  <div className="flex flex-col items-center space-y-1">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <span className="text-[10px]">PC Windows</span>
                  </div>
                  <div className="h-px w-8 bg-blue-500/40"></div>
                  <div className="flex flex-col items-center space-y-1">
                    <Laptop className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px]">Ordinateur portable</span>
                  </div>
                  <div className="h-px w-8 bg-emerald-500/40"></div>
                  <div className="flex flex-col items-center space-y-1">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <span className="text-[10px]">Mobile / Web</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                  Vos colonnes "À faire", "En cours" et "Fait" sont synchronisées en continu sur Firebase Cloud.
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          ) : (
            /* User not connected */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-semibold text-white">
                  Connectez-vous pour synchroniser vos tâches
                </h4>
                <p className="text-slate-400 text-xs">
                  Retrouvez vos projets et vos tâches Kanban sauvegardés et synchronisés en direct.
                </p>
              </div>

              {/* Tabs: Google or Email */}
              <div className="flex p-0.5 bg-[#0f121d] rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => { setAuthMode('google'); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    authMode === 'google'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Compte Google
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('email'); setError(null); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    authMode === 'email'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Email & Mot de passe
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-lg flex items-start space-x-2 text-red-300 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {authMode === 'google' ? (
                /* Google Mode */
                <div className="space-y-3">
                  <div className="space-y-2 bg-[#1e2334] p-3 rounded-lg border border-white/10 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Connexion 1-clic avec votre compte Google</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Synchronisation Cloud sécurisée sur Firebase</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-semibold rounded-lg text-xs flex items-center justify-center space-x-2.5 shadow-lg transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>Continuer avec Google</span>
                  </button>
                </div>
              ) : (
                /* Email / Password Mode */
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {isRegister && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Nom d'affichage</label>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Votre nom"
                          className="w-full bg-[#0f121d] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full bg-[#0f121d] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#0f121d] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer mt-2"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isRegister ? 'Créer mon compte' : 'Se connecter'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsRegister(!isRegister); setError(null); }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      {isRegister ? 'Déjà un compte ? Connectez-vous' : "Pas encore de compte ? Créer un compte"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#1e2334] border-t border-white/10 flex items-center justify-end">
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
