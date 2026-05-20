import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Trash2, LogOut, TreePine, Award, Flame, ChevronRight, Settings, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Navigation } from "./Navigation";
import { userApi, authApi } from "../api";
import { useAuth } from "../auth";
import { useUserStats } from "../hooks";

export function ProfilePage() {
  const auth = useAuth();
  const { userProfile: profile, isLoadingProfile: isLoadingProf } = auth;
  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useUserStats();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();

  const isLoading = isLoadingProf || isLoadingStats;

  useEffect(() => {
    if (isErrorStats) {
      toast.error("Impossible de charger les statistiques.");
    }
  }, [isErrorStats]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore — stateless JWT */ }
    auth.setUser(null);
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    try {
      await userApi.deleteMe(false);
      auth.setUser(null);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la suppression du compte.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas."); return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit comporter au moins 8 caractères."); return;
    }
    setIsChangingPassword(true);
    try {
      await userApi.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success("Mot de passe modifié avec succès !");
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors du changement de mot de passe.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 rounded-full"
          style={{ borderColor: 'var(--viv-secondary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const user = profile?.user;
  const displayName = user?.userName ?? user?.firstName ?? "Utilisateur";

  return (
    <div className="min-h-screen pb-32 md:pb-8 md:pl-64 lg:pl-72" style={{ backgroundColor: 'var(--viv-beige)' }}>
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-6 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--viv-navy)' }}>Profil</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-semibold"
                  style={{ background: 'linear-gradient(to bottom right, var(--viv-red-light), var(--viv-red))' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl mb-1" style={{ color: 'var(--viv-navy)' }}>{displayName}</h2>
                  <p className="flex items-center gap-2 text-sm md:text-base" style={{ color: '#64748B' }}>
                    <Mail className="w-4 h-4" />{user?.email ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--viv-navy)' }}>{profile?.treesPlanted ?? 0}</div>
                  <div className="text-xs md:text-sm" style={{ color: '#64748B' }}>Arbres</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--viv-navy)' }}>{profile?.points ?? 0}</div>
                  <div className="text-xs md:text-sm" style={{ color: '#64748B' }}>Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--viv-navy)' }}>{profile?.streak ?? 0}</div>
                  <div className="text-xs md:text-sm" style={{ color: '#64748B' }}>Série de jours</div>
                </div>
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--viv-navy)' }}>Statistiques</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(42, 49, 212, 0.1)' }}>
                    <Award className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--viv-secondary)' }} />
                  </div>
                  <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--viv-navy)' }}>{stats?.challengesCompleted ?? 0}</div>
                  <div className="text-sm" style={{ color: '#64748B' }}>Défis terminés</div>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}>
                    <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                  <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--viv-navy)' }}>{stats?.bestStreak ?? profile?.bestStreak ?? 0}</div>
                  <div className="text-sm" style={{ color: '#64748B' }}>Meilleure série</div>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-4 col-span-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(42, 49, 212, 0.1)' }}>
                    <TreePine className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--viv-secondary)' }} />
                  </div>
                  <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--viv-navy)' }}>{stats?.co2ReducedThisYear?.toFixed(1) ?? "0.0"}t</div>
                  <div className="text-sm" style={{ color: '#64748B' }}>CO2 réduit cette année</div>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--viv-navy)' }}>Succès</h3>
              <div className="grid grid-cols-4 gap-3">
                {(profile?.achievements ?? []).map((ach, index) => (
                  <div key={index} className={`bg-white rounded-2xl shadow-md p-4 text-center ${!ach.unlocked ? "opacity-40" : ""}`}>
                    <div className="text-3xl mb-2">🏅</div>
                    <div className="text-xs" style={{ color: 'var(--viv-navy)' }}>{ach.name}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--viv-navy)' }}>Paramètres du compte</h3>
              <div className="space-y-2">
                <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:shadow-md transition-all text-left" style={{ backgroundColor: 'rgba(42, 49, 212, 0.1)' }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--viv-secondary)' }}>
                    <Lock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium md:text-lg" style={{ color: 'var(--viv-navy)' }}>Changer le mot de passe</div>
                    <div className="text-sm" style={{ color: '#64748B' }}>Mettre à jour votre sécurité</div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: '#94A3B8' }} />
                </button>

                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:shadow-md transition-all text-left bg-blue-50">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <LogOut className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium md:text-lg text-blue-900">Se déconnecter</div>
                    <div className="text-sm text-blue-700">Fermer la session</div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: '#3B82F6' }} />
                </button>

                <button onClick={handleDeleteAccount} className="w-full flex items-center gap-3 p-4 rounded-2xl hover:shadow-md transition-all text-left bg-red-50">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium md:text-lg text-red-900">Supprimer le compte</div>
                    <div className="text-sm text-red-700">Cette action est irréversible</div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: '#EF4444' }} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl relative">
            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6 pr-8" style={{ color: 'var(--viv-navy)' }}>Changer le mot de passe</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: "Mot de passe actuel", key: "currentPassword", placeholder: "" },
                { label: "Nouveau mot de passe", key: "newPassword", placeholder: "Minimum 8 caractères" },
                { label: "Confirmer le nouveau mot de passe", key: "confirmPassword", placeholder: "" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--viv-navy)' }}>{label}</label>
                  <input type="password" value={(passwordForm as any)[key]} placeholder={placeholder}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                    style={{ border: '1px solid rgba(78, 175, 137, 0.3)', '--tw-ring-color': 'var(--viv-red)' } as any}
                    required disabled={isChangingPassword} />
                </div>
              ))}
              <button type="submit" disabled={isChangingPassword}
                className="w-full text-white py-3 rounded-xl font-semibold transition-colors hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--viv-secondary)' }}>
                {isChangingPassword ? "Modification…" : "Modifier le mot de passe"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <Navigation currentPage="profile" />
    </div>
  );
}
