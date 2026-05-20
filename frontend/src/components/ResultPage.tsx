import { useEffect, useState } from "react";
import { Link } from "react-router";
import { TrendingDown, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { emissionsApi, getToken, type EmissionsSaveResponse } from "../api";
import viverisLogo from "../Pack_charte_graphique/Logos/Logos_Viveris/Avec signature/Viveris - Logo - Baseline - RVB - Noir.png";

export function ResultPage() {
  const [result, setResult] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedResult, setSavedResult] = useState<EmissionsSaveResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    const stored = sessionStorage.getItem("quizResult");
    if (stored) setResult(JSON.parse(stored));
    const storedPred = sessionStorage.getItem("userPredictions");
    if (storedPred) setPredictions(JSON.parse(storedPred));
  }, []);

  // Auto-save to backend when logged in
  useEffect(() => {
    if (!result || !isLoggedIn || savedResult || isSaving) return;
    setIsSaving(true);
    const answersMap: Record<string, { label: string; value: number; co2: number }> = {};
    if (result.answers) {
      for (const [qId, ans] of Object.entries(result.answers)) {
        const a = ans as any;
        answersMap[String(qId)] = { label: a.label, value: a.value, co2: a.co2 };
      }
    }
    emissionsApi
      .save({
        quizResult: { totalInTons: result.totalInTons, answers: answersMap },
        userPredictions: {
          highestConsumption: predictions?.highestConsumption ?? null,
          flexibility: predictions?.flexibility ?? [],
        },
      })
      .then((res) => { setSavedResult(res); toast.success("Empreinte enregistrée !"); })
      .catch((err: any) => toast.error(err.message ?? "Erreur lors de l'enregistrement."))
      .finally(() => setIsSaving(false));
  }, [result, isLoggedIn]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
        <p style={{ color: 'var(--viv-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  const categoryTotals: Record<string, number> = savedResult?.categoryEmissions ?? (() => {
    const totals: Record<string, number> = { Transport: 0, Alimentation: 0, Énergie: 0, Consommation: 0 };
    if (result.answers) {
      const ans = result.answers;
      const cachedQ: any[] = (() => { try { return JSON.parse(sessionStorage.getItem("quizQuestions") ?? "[]"); } catch { return []; } })();
      if (cachedQ.length > 0) {
        for (const [qId, answer] of Object.entries(ans)) {
          const q = cachedQ.find((q: any) => String(q.id) === String(qId));
          if (q) totals[q.category] = (totals[q.category] ?? 0) + ((answer as any).co2 ?? 0) / 1000;
        }
      } else {
        totals.Transport = Number((((ans[1]?.co2 || 0) + (ans[2]?.co2 || 0)) / 1000).toFixed(2));
        totals.Alimentation = Number((((ans[3]?.co2 || 0) + (ans[4]?.co2 || 0)) / 1000).toFixed(2));
        totals.Énergie = Number((((ans[5]?.co2 || 0) + (ans[6]?.co2 || 0)) / 1000).toFixed(2));
        totals.Consommation = Number((((ans[7]?.co2 || 0) + (ans[8]?.co2 || 0)) / 1000).toFixed(2));
      }
    } else { totals.Transport = 1.8; totals.Alimentation = 1.2; totals.Énergie = 1.5; totals.Consommation = 0.7; }
    return totals;
  })();

  localStorage.setItem("categoryEmissions", JSON.stringify(categoryTotals));
  if (predictions?.flexibility?.length > 0) localStorage.setItem("userFlexibility", JSON.stringify(predictions.flexibility));

  const chartData = [
    { name: "Transport", value: Number((categoryTotals.Transport ?? 0).toFixed(2)), color: "#ff5046" },
    { name: "Alimentation", value: Number((categoryTotals.Alimentation ?? 0).toFixed(2)), color: "#2a31d4" },
    { name: "Énergie", value: Number((categoryTotals.Énergie ?? 0).toFixed(2)), color: "#7e83e5" },
    { name: "Consommation", value: Number((categoryTotals.Consommation ?? 0).toFixed(2)), color: "#ff958f" },
  ];

  const totalCO2 = savedResult?.quizResult?.totalInTons ?? result.totalInTons;
  const targetCO2 = savedResult?.targetCO2 ?? 2.3;
  const difference = Number(totalCO2) - targetCO2;
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => (b as number) - (a as number)).map(([n]) => n);
  const categoryMap: Record<string, string> = { transport: "Transport", food: "Alimentation", energy: "Énergie", consumption: "Consommation" };
  const predictedHighest = predictions?.highestConsumption?.map((id: string) => categoryMap[id]) || [];
  const sumOfValues = chartData.reduce((acc, e) => acc + e.value, 0);
  const dataWithPercentages = chartData
    .map((e) => ({ ...e, percentage: sumOfValues > 0 ? Math.round((e.value / sumOfValues) * 100) : 0 }))
    .sort((a, b) => b.value - a.value);
  if (sumOfValues > 0) {
    const diff = 100 - dataWithPercentages.reduce((a, c) => a + c.percentage, 0);
    if (diff !== 0 && dataWithPercentages.length > 0) dataWithPercentages[0].percentage += diff;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--viv-beige)' }}>
      <header className="container mx-auto px-4 py-6">
        <img src={viverisLogo} alt="Viveris Carbone" className="h-20 md:h-24 object-contain" />
      </header>
      <main className="container mx-auto px-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-[var(--viv-navy)] mb-6 text-center">Votre empreinte carbone actuelle</h1>
            {isSaving && <p className="text-center text-sm mb-4" style={{ color: '#64748B' }}>Enregistrement…</p>}
            <div className="text-center mb-8">
              <div className="inline-block p-8 bg-white rounded-3xl">
                <div className="text-6xl font-bold text-[var(--viv-navy)]">{totalCO2}</div>
                <div className="text-xl text-[var(--viv-navy)] mt-2">tonnes de CO2 / an</div>
              </div>
            </div>
            {difference > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-amber-900 font-medium">Vous êtes à {difference.toFixed(1)} tonnes au-dessus de l'objectif 2050</p>
                    <p className="text-amber-700 text-sm mt-1">L'objectif fixé par le Haut Conseil pour le Climat est de {targetCO2} tonnes de CO2 par an d'ici 2050.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 border border-[var(--viv-red-light)] rounded-xl p-4 mb-8">
                <p className="text-[var(--viv-navy)] text-center">Félicitations ! Vous êtes en dessous de l'objectif 2050 de {targetCO2} tonnes de CO2 par an.</p>
              </div>
            )}
            <div className="mb-8 max-w-lg mx-auto">
              <h3 className="text-xl font-semibold text-[var(--viv-navy)] mb-4 text-center">Répartition par domaine</h3>
              <div className="space-y-3">
                {dataWithPercentages.map((entry, index) => {
                  const actualRank = sortedCategories.indexOf(entry.name) + 1;
                  const nPred = predictedHighest.length > 0 ? predictedHighest.length : 3;
                  let icon = null;
                  if (predictions) {
                    if (predictedHighest.includes(entry.name)) {
                      icon = actualRank <= nPred ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-[var(--viv-red)]" />;
                    } else {
                      icon = actualRank <= nPred ? <XCircle className="w-5 h-5 text-[var(--viv-red)]" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />;
                    }
                  }
                  return (
                    <div key={`list-${index}`} className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="font-medium text-[var(--viv-navy)]">{entry.name}</span>
                        {icon && <div className="ml-2">{icon}</div>}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold" style={{ color: entry.color }}>{entry.percentage}%</span>
                        <span className="text-gray-500 w-12 text-right">{entry.value}t</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {isLoggedIn ? (
              <div className="flex justify-center mt-8">
                <Link to="/dashboard" className="px-8 py-3 bg-[var(--viv-red)] text-white rounded-full font-semibold hover:bg-[var(--viv-red-dark)] transition-colors text-center">
                  Retour au tableau de bord
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="px-8 py-3 bg-[var(--viv-red)] text-white rounded-full font-semibold hover:bg-[var(--viv-red-dark)] transition-colors text-center">Créer mon compte</Link>
                  <Link to="/login" className="px-8 py-3 bg-white text-[var(--viv-red)] border-2 border-[var(--viv-red)] rounded-full font-semibold hover:bg-white/50 transition-colors text-center">Me connecter</Link>
                </div>
                <p className="text-center text-[var(--viv-navy)] text-sm mt-4">Enregistrez vos données pour suivre vos progrès et accéder aux défis personnalisés</p>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
