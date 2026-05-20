import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Car, Utensils, Zap, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const categories = [
  {
    id: "transport",
    name: "Transport",
    icon: Car,
    color: "emerald",
    description: "Voiture, avion, transports en commun",
  },
  {
    id: "food",
    name: "Alimentation",
    icon: Utensils,
    color: "green",
    description: "Viande, produits locaux, consommation",
  },
  {
    id: "energy",
    name: "Énergie",
    icon: Zap,
    color: "teal",
    description: "Logement, chauffage, électricité",
  },
  {
    id: "consumption",
    name: "Consommation",
    icon: ShoppingBag,
    color: "lime",
    description: "Vêtements, électronique, achats",
  },
];

export function PredictionPage() {
  const [step, setStep] = useState(1);
  const [highestConsumption, setHighestConsumption] = useState<string[]>([]);
  const [flexibility, setFlexibility] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    if (step === 1) {
      // Gestion de la sélection pour la consommation
      if (highestConsumption.includes(categoryId)) {
        setHighestConsumption(highestConsumption.filter((id) => id !== categoryId));
      } else if (highestConsumption.length < 3) {
        setHighestConsumption([...highestConsumption, categoryId]);
      }
    } else {
      // Gestion de la sélection pour la flexibilité
      if (flexibility.includes(categoryId)) {
        setFlexibility(flexibility.filter((id) => id !== categoryId));
      } else if (flexibility.length < 3) {
        setFlexibility([...flexibility, categoryId]);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // Store predictions in sessionStorage
      sessionStorage.setItem(
        "userPredictions",
        JSON.stringify({ highestConsumption, flexibility })
      );
      navigate("/result");
    }
  };

  const isSelected = (categoryId: string) => {
    return step === 1
      ? highestConsumption.includes(categoryId)
      : flexibility.includes(categoryId);
  };

  const canProceed = step === 1 ? (highestConsumption.length >= 1 && highestConsumption.length <= 3) : (flexibility.length >= 1 && flexibility.length <= 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--viv-beige)' }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <Leaf className="w-8 h-8" style={{ color: 'var(--viv-secondary)' }} />
          <span className="text-2xl font-bold" style={{ color: 'var(--viv-navy)' }}>
            Viveris Carbone
          </span>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full`}
              style={{ backgroundColor: step === 1 ? 'var(--viv-red)' : 'var(--viv-red-light)' }}
            />
            <div
              className={`w-3 h-3 rounded-full`}
              style={{ backgroundColor: step === 2 ? 'var(--viv-red)' : '#D1D5DB' }}
            />
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--viv-navy)' }}>
            étape {step} sur 2
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div
            className="rounded-3xl shadow-2xl p-8 md:p-12"
            style={{ backgroundColor: "white" }}
          >
            {/* Question */}
            <div className="mb-10 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block px-5 py-2 rounded-full text-sm font-medium mb-6"
                style={{
                  backgroundColor: "var(--viv-secondary)",
                  color: "white",
                }}
              >
                {step === 1 ? "Prédiction" : "Flexibilité"}
              </motion.div>

              <h2 className="text-3xl md:text-4xl mb-4" style={{ color: "var(--viv-navy)" }}>
                {step === 1
                  ? "Selon vous, dans quels domaines consommez-vous le plus ?"
                  : "Dans quels domaines avez-vous le plus de flexibilité?"}
              </h2>
              <p className="text-lg" style={{ color: "#64748B" }}>
                {step === 1
                  ? "Sélectionnez entre 1 et 3 domaines où vous pensez générer le plus de CO2"
                  : "Sélectionnez entre 1 et 3 domaines où vous pouvez le plus facilement faire des changements"}
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const selected = isSelected(category.id);
                const selectionIndex = step === 1
                  ? highestConsumption.indexOf(category.id)
                  : flexibility.indexOf(category.id);
                const showNumber = selectionIndex !== -1;

                return (
                  <motion.button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-6 rounded-2xl border-3 transition-all text-left ${
                      selected
                        ? "shadow-xl"
                        : "shadow-md hover:shadow-lg"
                    }`}
                    style={{
                      borderColor: selected ? "var(--viv-red)" : "#E2E8F0",
                      backgroundColor: selected ? "var(--viv-beige)" : "white",
                      borderWidth: selected ? "3px" : "2px",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{
                          backgroundColor: selected ? "var(--viv-red)" : "#F1F5F9",
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: selected ? "white" : "var(--viv-red)" }}
                        />
                      </div>
                      {showNumber && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: "var(--viv-red)" }}
                        >
                          {selectionIndex + 1}
                        </motion.div>
                      )}
                    </div>
                    <h3 className="text-xl mb-2" style={{ color: "var(--viv-navy)" }}>
                      {category.name}
                    </h3>
                    <p className="text-sm" style={{ color: "#64748B" }}>
                      {category.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Selection counter */}
            <div className="text-center mb-8">
              <p className="text-sm" style={{ color: "#64748B" }}>
                {step === 1 ? highestConsumption.length : flexibility.length} / 3
                domaines sélectionnés
              </p>
            </div>

            {/* Navigation Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={handleNext}
                disabled={!canProceed}
                whileHover={canProceed ? { scale: 1.05 } : {}}
                whileTap={canProceed ? { scale: 0.95 } : {}}
                className="flex items-center gap-3 px-8 py-4 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                style={{
                  backgroundColor: canProceed ? "var(--viv-red)" : "#CBD5E1",
                }}
              >
                {step === 1 ? "Continuer" : "Voir mes résultats"}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Skip link (optional) */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/result")}
            className="text-sm underline hover:no-underline transition-all"
            style={{ color: "#64748B" }}
          >
            Passer cette étape
          </button>
        </div>
      </main>
    </div>
  );
}
