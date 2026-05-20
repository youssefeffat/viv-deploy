import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { authApi, userApi, setToken, setStoredUser, emissionsApi } from "../api";
import { useAuth } from "../auth";
import viverisLogo from "../Pack_charte_graphique/Logos/Logos_Viveris/Avec signature/Viveris - Logo - Baseline - RVB - Noir.png";

export function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Login → get token
      const loginRes = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      setToken(loginRes.access_token);

      // 2. Fetch user profile and cache it
      const profile = await userApi.getMe();
      setStoredUser(profile.user);
      auth.setUser(profile.user);

      // If there's a quiz result in sessionStorage (user completed quiz before logging in), save it now
      const stored = sessionStorage.getItem("quizResult");
      if (stored) {
        try {
          const res = JSON.parse(stored);
          const answersMap: Record<string, { label: string; value: number; co2: number }> = {};
          if (res.answers) {
            for (const [qId, ans] of Object.entries(res.answers)) {
              const a: any = ans as any;
              answersMap[String(qId)] = { label: a.label, value: a.value, co2: a.co2 };
            }
          }
          const predRaw = sessionStorage.getItem("userPredictions");
          const preds = predRaw ? JSON.parse(predRaw) : null;
          await emissionsApi.save({
            quizResult: { totalInTons: res.totalInTons, answers: answersMap },
            userPredictions: {
              highestConsumption: preds?.highestConsumption ?? null,
              flexibility: preds?.flexibility ?? [],
            },
          });
          toast.success("Empreinte enregistrée !");
          
          // Clear it so it doesn't trigger again on future logins
          sessionStorage.removeItem("quizResult");
          sessionStorage.removeItem("userPredictions");
        } catch (err: any) {
          // non-fatal — continue to dashboard
        }
      }

      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--viv-beige)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={viverisLogo} alt="Viveris Carbone" className="h-12 object-contain" />
          </div>

          <h2 className="text-2xl text-center mb-6" style={{ color: 'var(--viv-navy)' }}>
            Connexion
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--viv-navy)' }}>
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--viv-secondary)' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid rgba(78, 175, 137, 0.3)',
                    '--tw-ring-color': 'var(--viv-red)'
                  } as any}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--viv-navy)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--viv-secondary)' }} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid rgba(78, 175, 137, 0.3)',
                    '--tw-ring-color': 'var(--viv-red)'
                  } as any}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 rounded-xl font-semibold transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--viv-secondary)' }}
            >
              {isLoading ? "Connexion…" : "Me connecter"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
            Vous n'avez pas de compte ?{" "}
            <Link to="/quiz" className="font-semibold" style={{ color: 'var(--viv-secondary)' }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
