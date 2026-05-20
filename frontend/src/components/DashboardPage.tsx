import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Car, UtensilsCrossed, Zap, Leaf, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";
import { Navigation } from "./Navigation";
import { emissionsApi, getStoredUser, type UserProfileDashboardResponse, type QuizQuestion } from "../api";
import { useAuth } from "../auth";
import { useQuizQuestions } from "../hooks";

const categoryMap: Record<string, string> = {
  "Mobilité": "Transport",
  "Alimentation": "Alimentation",
  "Énergie": "Énergie",
  "Mode de vie": "Consommation",
};

const categoryIcons: Record<string, any> = {
  "Mobilité": Car,
  "Alimentation": UtensilsCrossed,
  "Énergie": Zap,
  "Mode de vie": Leaf,
};

export function DashboardPage() {
  const { userProfile: profile, isLoadingProfile: isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>({ name: "", icon: Leaf, numericValue: 0 });
  const [domainAnswers, setDomainAnswers] = useState<Record<string, any>>({});
  const { data: apiQuestions = [], isError: isQuizError } = useQuizQuestions();
  const [categoryTotals, setCategoryTotals] = useState({
    "Mobilité": 0, "Alimentation": 0, "Énergie": 0, "Mode de vie": 0,
  });
  const [recentModifications, setRecentModifications] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.categoryEmissions) {
      const ce = profile.categoryEmissions;
      setCategoryTotals({
        "Mobilité": ce["Transport"] ?? ce["Mobilité"] ?? 0,
        "Alimentation": ce["Alimentation"] ?? 0,
        "Énergie": ce["Énergie"] ?? 0,
        "Mode de vie": ce["Consommation"] ?? ce["Mode de vie"] ?? 0,
      });
    }

    if (profile?.history && profile.history.length > 1) {
      const mods: any[] = [];
      const history = profile.history;
      
      const cats = [
        { key: "transport_co2", name: "Mobilité", icon: Car },
        { key: "food_co2", name: "Alimentation", icon: UtensilsCrossed },
        { key: "energy_co2", name: "Énergie", icon: Zap },
        { key: "consumption_co2", name: "Mode de vie", icon: Leaf }
      ];

      for (let i = 0; i < history.length - 1; i++) {
        const curr = history[i];
        const prev = history[i + 1];
        
        cats.forEach(cat => {
          const currVal = curr[cat.key] || 0;
          const prevVal = prev[cat.key] || 0;
          const diff = currVal - prevVal;
          
          if (Math.abs(diff) > 0.01) { // If difference is significant
            const dateStr = new Date(curr.created_at).toLocaleDateString('fr-FR');
            const valStr = diff > 0 ? `+${diff.toFixed(2)}t` : `${diff.toFixed(2)}t`;
            mods.push({ name: cat.name, date: dateStr, value: valStr, icon: cat.icon });
          }
        });
      }
      setRecentModifications(mods.slice(0, 4));
    }
  }, [profile]);

  useEffect(() => {
    if (isQuizError) {
      toast.error("Le formulaire d'édition n'est pas disponible.");
    }
  }, [isQuizError]);

  const displayTotal = Object.values(categoryTotals).reduce((a, b) => a + b, 0).toFixed(2);

  const consumptions = [
    { name: "Mobilité", value: categoryTotals["Mobilité"].toFixed(2) + "t", numericValue: categoryTotals["Mobilité"], icon: Car },
    { name: "Alimentation", value: categoryTotals["Alimentation"].toFixed(2) + "t", numericValue: categoryTotals["Alimentation"], icon: UtensilsCrossed },
    { name: "Énergie", value: categoryTotals["Énergie"].toFixed(2) + "t", numericValue: categoryTotals["Énergie"], icon: Zap },
    { name: "Mode de vie", value: categoryTotals["Mode de vie"].toFixed(2) + "t", numericValue: categoryTotals["Mode de vie"], icon: Leaf },
  ];

  const handleOpenModal = (item: any) => {
    setSelectedCategory(item);
    const domainCat = categoryMap[item.name];
    const catQs = apiQuestions.filter((q) => q.category === domainCat);
    const existing: Record<string, any> = {};
    const savedAnswers = profile?.quizResult;
    catQs.forEach((q) => {
      const cached = sessionStorage.getItem("quizResult");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.answers?.[q.id]) existing[q.id] = parsed.answers[q.id];
      }
    });
    setDomainAnswers(existing);
    setIsModalOpen(true);
  };

  const handleSaveModification = async () => {
    const domainCat = categoryMap[selectedCategory.name];
    const catQs = apiQuestions.filter((q) => q.category === domainCat);
    const answeredCount = catQs.filter((q) => domainAnswers[q.id]).length;
    if (answeredCount < catQs.length) {
      toast.error("Veuillez répondre à toutes les questions."); return;
    }
    const answers: Record<string, { label: string; value: number; co2: number }> = {};
    catQs.forEach((q) => {
      const a = domainAnswers[q.id];
      answers[q.id] = { label: a.label, value: a.value, co2: a.co2 };
    });
    try {
      const res = await emissionsApi.updateCategory({ category: domainCat, answers });
      // Map API category name back to UI category name
      const uiCatName = Object.keys(categoryMap).find((k) => categoryMap[k] === res.category) ?? selectedCategory.name;
      setCategoryTotals((prev) => ({ ...prev, [uiCatName]: res.newCategoryTotal }));
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      const diffNum = res.newCategoryTotal - selectedCategory.numericValue;
      const valStr = diffNum > 0 ? `+${diffNum.toFixed(2)}t` : `${diffNum.toFixed(2)}t`;
      setRecentModifications((prev) => [
        { name: selectedCategory.name, date: dateStr, value: valStr, icon: selectedCategory.icon },
        ...prev.slice(0, 3),
      ]);
      toast.success(`Consommations pour ${selectedCategory.name} mises à jour !`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la mise à jour.");
    }
  };

  const IconBox = ({ icon: Icon }: { icon: any }) => (
    <div className="w-8 h-8 rounded-full flex items-center justify-center min-w-[2rem]" style={{ backgroundColor: 'rgba(42, 49, 212, 0.1)', color: 'var(--viv-secondary)' }}>
      <Icon className="w-4 h-4" />
    </div>
  );

  const user = profile?.user;
  const displayName = user?.userName ?? user?.firstName ?? "Utilisateur";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 rounded-full"
          style={{ borderColor: 'var(--viv-secondary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 md:pb-8 md:pl-64 lg:pl-72" style={{ backgroundColor: 'var(--viv-beige)' }}>
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-2xl ml-0">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 pt-6 pb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--viv-red)' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--viv-navy)' }}>{displayName}</span>
        </motion.div>

        <div className="space-y-6">
          {/* Mon empreinte */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center py-10">
            <div className="w-full text-left mb-4"><h2 className="text-lg font-bold" style={{ color: 'var(--viv-navy)' }}>Mon empreinte</h2></div>
            <div className="text-5xl font-bold mb-2" style={{ color: 'var(--viv-navy)' }}>{displayTotal}</div>
            <div className="text-sm font-medium" style={{ color: '#8892A0' }}>tonnes de CO2 / an</div>
          </motion.div>

          {/* Mes consommations actuelles */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--viv-navy)' }}>Mes consommations actuelles</h2>
            <div className="grid grid-cols-2 gap-4">
              {consumptions.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3"><IconBox icon={item.icon} /><span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--viv-navy)' }}>{item.name}</span></div>
                  <span className="text-sm font-medium" style={{ color: 'var(--viv-navy)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Modifier mes consommations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--viv-navy)' }}>Modifier mes consommations</h2>
            <div className="grid grid-cols-2 gap-4">
              {consumptions.map((item, i) => (
                <button key={i} onClick={() => handleOpenModal(item)} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[var(--viv-secondary)]">
                  <div className="flex items-center gap-3"><IconBox icon={item.icon} /><span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--viv-navy)' }}>{item.name}</span></div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Mes dernières modifications */}
          {recentModifications.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--viv-navy)' }}>Mes anciennes consommations</h2>
              <div className="grid grid-cols-2 gap-4">
                {recentModifications.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 w-3/4"><IconBox icon={item.icon} /><div className="flex flex-col truncate"><span className="text-sm font-medium leading-tight truncate hidden sm:block" style={{ color: 'var(--viv-navy)' }}>{item.name}</span><span className="text-[10px] text-gray-400">{item.date}</span></div></div>
                    <span className="text-sm font-medium" style={{ color: 'var(--viv-navy)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl relative my-auto max-h-[90vh] flex flex-col">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none z-10"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-2 pr-8 shrink-0" style={{ color: 'var(--viv-navy)' }}>Recalculer : {selectedCategory.name}</h3>
            <p className="text-sm text-gray-500 mb-6 shrink-0">Répondez à ces questions pour mettre à jour votre empreinte carbone sur ce domaine.</p>
            <div className="mb-6 overflow-y-auto pr-2 pb-2 space-y-6">
              {apiQuestions.filter((q) => q.category === categoryMap[selectedCategory.name]).map((q) => (
                <div key={q.id} className="space-y-3">
                  <p className="font-medium text-sm" style={{ color: 'var(--viv-navy)' }}>{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => {
                      const isSel = domainAnswers[q.id]?.label === opt.label;
                      return (
                        <button key={idx} onClick={() => setDomainAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${isSel ? "shadow-sm bg-[var(--viv-red-light)] opacity-70" : "bg-white hover:bg-gray-50 border-gray-200"}`}
                          style={{ color: 'var(--viv-navy)', borderColor: isSel ? 'var(--viv-red)' : undefined }}>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSaveModification} className="w-full py-3 rounded-xl text-white font-medium shadow-md transition-transform hover:scale-[1.02] focus:outline-none shrink-0 mt-auto" style={{ backgroundColor: 'var(--viv-secondary)' }}>
              Recalculer et Enregistrer
            </button>
          </motion.div>
        </div>
      )}

      <Navigation currentPage="dashboard" />
    </div>
  );
}
