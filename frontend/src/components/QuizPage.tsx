import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { quizApi, type QuizQuestion } from "../api";
import viverisLogo from "../Pack_charte_graphique/Logos/Logos_Viveris/Avec signature/Viveris - Logo - Baseline - RVB - Noir.png";

// Export a stable reference so DashboardPage can still call quizApi independently
export type { QuizQuestion };

export function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    quizApi
      .getQuestions()
      .then((data) => {
        setQuestions(data);
        // Cache for offline / cross-page use
        sessionStorage.setItem("quizQuestions", JSON.stringify(data));
      })
      .catch((err: any) => {
        // Fallback: try cached version from sessionStorage
        const cached = sessionStorage.getItem("quizQuestions");
        if (cached) {
          setQuestions(JSON.parse(cached));
          toast.warning("Chargement hors-ligne des questions.");
        } else {
          toast.error(err.message ?? "Impossible de charger les questions.");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAnswer = (option: any) => {
    const q = questions[currentQuestion];
    setAnswers({ ...answers, [q.id]: option });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate total CO2 and navigate to prediction page
      const totalCO2 = Object.values(answers).reduce(
        (sum: number, ans: any) => sum + (ans.co2 || 0),
        0
      );
      const totalInTons = (totalCO2 / 1000).toFixed(1);
      sessionStorage.setItem("quizResult", JSON.stringify({ totalInTons, answers }));
      navigate("/prediction");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 rounded-full border-t-transparent"
          style={{ borderColor: 'var(--viv-secondary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
        <p className="text-lg" style={{ color: 'var(--viv-navy)' }}>Aucune question disponible.</p>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--viv-beige)' }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <img src={viverisLogo} alt="Viveris Carbone" className="h-20 md:h-24 object-contain" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--viv-red-light)', opacity: 0.3 }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: 'var(--viv-secondary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm mt-2 text-center" style={{ color: '#64748B' }}>
            Question {currentQuestion + 1} sur {questions.length}
          </p>
        </div>
      </div>

      {/* Question */}
      <main className="container mx-auto px-4 pb-20">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
            <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: 'var(--viv-red-light)', color: 'var(--viv-navy)', opacity: 0.8 }}>
              {currentQ.category}
            </div>

            <h2 className="text-2xl mb-8" style={{ color: 'var(--viv-navy)' }}>
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer?.label === option.label
                      ? "shadow-lg"
                      : "bg-white hover:shadow-md"
                  }`}
                  style={{
                    borderColor: selectedAnswer?.label === option.label ? 'var(--viv-red)' : '#E2E8F0',
                    backgroundColor: selectedAnswer?.label === option.label ? 'var(--viv-red-light)' : 'white',
                    opacity: selectedAnswer?.label === option.label ? 0.3 : 1,
                  }}
                >
                  <span style={{ color: 'var(--viv-navy)' }}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ color: 'var(--viv-secondary)' }}
            >
              <ArrowLeft className="w-5 h-5" />
              Précédent
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: selectedAnswer ? 'var(--viv-red)' : '#CBD5E1' }}
            >
              {currentQuestion === questions.length - 1 ? "Voir le résultat" : "Suivant"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
