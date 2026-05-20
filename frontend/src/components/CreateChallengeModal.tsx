import { useState } from "react";
import { X, UtensilsCrossed, Car, Zap, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (challenge: { title: string; category: string; points: number }) => void;
}

export function CreateChallengeModal({ isOpen, onClose, onSubmit }: CreateChallengeModalProps) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // API constraint: points must be between 5 and 500
  const [points, setPoints] = useState(50);

  const categories = [
    { id: "alimentation", name: "Alimentation", icon: UtensilsCrossed, color: "var(--viv-red-dark)" },
    { id: "transport", name: "Transport", icon: Car, color: "var(--viv-red-light)" },
    { id: "energie", name: "Énergie", icon: Zap, color: "var(--viv-secondary)" },
    { id: "consommation", name: "Consommation", icon: Leaf, color: "#1A6B47" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && selectedCategory) {
      onSubmit({
        title,
        category: categories.find((c) => c.id === selectedCategory)?.name || "",
        points,
      });
      setTitle("");
      setSelectedCategory("");
      setPoints(50);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--viv-navy)' }}>Créer un défi</h2>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5" style={{ color: 'var(--viv-navy)' }} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--viv-navy)' }}>Titre du défi</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Utiliser les transports en commun"
                    className="w-full px-4 py-3 rounded-2xl focus:outline-none focus:ring-2"
                    style={{ border: '2px solid rgba(15, 23, 42, 0.1)', '--tw-ring-color': 'var(--viv-red)', color: 'var(--viv-navy)' } as any}
                    required />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--viv-navy)' }}>Catégorie</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isSel = selectedCategory === category.id;
                      return (
                        <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)}
                          className="p-4 rounded-2xl transition-all"
                          style={{ border: `2px solid ${isSel ? category.color : 'rgba(15, 23, 42, 0.1)'}`, backgroundColor: isSel ? `${category.color}15` : 'white' }}>
                          <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: isSel ? category.color : 'var(--viv-text-secondary)' }} />
                          <div className="text-sm font-medium" style={{ color: isSel ? category.color : 'var(--viv-text-secondary)' }}>{category.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Points: range 5–500 per API constraint */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--viv-navy)' }}>
                    Points : <span style={{ color: 'var(--viv-red)' }}>{points}</span>
                  </label>
                  <input type="range" min="5" max="500" step="5" value={points} onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, var(--viv-red) 0%, var(--viv-red) ${((points - 5) / 495) * 100}%, #E2E8F0 ${((points - 5) / 495) * 100}%, #E2E8F0 100%)` }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--viv-text-tertiary)' }}>
                    <span>5</span><span>500</span>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: 'var(--viv-secondary)' }} disabled={!title || !selectedCategory}>
                  Créer un défi
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
