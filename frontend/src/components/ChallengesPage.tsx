import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, CheckCircle2, Circle, TreePine, Bell, Sprout, Sun, Cloud, Plus } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Navigation } from "./Navigation";
import { CreateChallengeModal } from "./CreateChallengeModal";
import { challengesApi, type ChallengeResponse } from "../api";
import { useAuth } from "../auth";
import { useChallenges, useChallengeToggle } from "../hooks";

export function ChallengesPage() {
  const { userProfile: profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: challenges = [], isLoading, isError, refetch: loadChallenges } = useChallenges();
  const toggleMutation = useChallengeToggle();
  const [totalPoints, setTotalPoints] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [treeProgress, setTreeProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    if (isError) {
      toast.error("Impossible de charger les défis.");
    }
  }, [isError]);

  useEffect(() => {
    if (profile) {
      setTotalPoints(profile.points ?? 0);
      setTreesPlanted(profile.treesPlanted ?? 0);
      setTreeProgress(Math.floor(((profile.points ?? 0) % 1000) / 10));
      setStreak(profile.streak ?? 0);
    }
  }, [profile]);

  const toggleChallenge = (id: string) => {
    const challenge = challenges.find((c) => c.id === id);
    if (!challenge) return;
    
    const isNowCompleted = !challenge.completed;
    const pointDelta = isNowCompleted ? challenge.points : -challenge.points;

    // 1. Snapshot previous state
    const previousPoints = totalPoints;
    const previousTrees = treesPlanted;
    const previousProgress = treeProgress;

    // 2. Optimistically update UI state instantly
    const newTotalPoints = Math.max(0, totalPoints + pointDelta);
    setTotalPoints(newTotalPoints);
    setTreesPlanted(Math.floor(newTotalPoints / 1000));
    setTreeProgress(Math.floor((newTotalPoints % 1000) / 10));

    // 3. Perform backend mutation
    toggleMutation.mutate(
      { id, completed: isNowCompleted },
      {
        onSuccess: (res) => {
          // Sync with exact server values
          setTotalPoints(res.totalPoints);
          setTreesPlanted(res.treesPlanted);
          setTreeProgress(res.treeProgress);
        },
        onError: (err: any) => {
          // Rollback on failure
          setTotalPoints(previousPoints);
          setTreesPlanted(previousTrees);
          setTreeProgress(previousProgress);
          toast.error(err.message ?? "Erreur lors de la mise à jour du défi.");
        },
      }
    );
  };

  const handleCreateChallenge = async (data: { title: string; category: string; points: number }) => {
    try {
      await challengesApi.create(data);
      toast.success("Défi créé avec succès !");
      loadChallenges();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la création du défi.");
    }
  };

  const handleUnlockBatch = async () => {

    try {
      const res = await challengesApi.unlockBatch();
      // Inject the new challenges directly into the cache — no second fetch!
      if (res.challenges) {
        queryClient.setQueryData(['challenges', 'recommendations'], res.challenges);
      } else {
        loadChallenges();
      }
    } catch (err: any) {
      toast.error(err.message ?? "Impossible de débloquer la prochaine série.");
    }
  };

  const completedToday = challenges.filter((c) => c.completed).length;
  const totalChallenges = challenges.length;

  useEffect(() => {
    if (completedToday === totalChallenges && totalChallenges > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [completedToday, totalChallenges]);

  return (
    <div className="min-h-screen pb-32 md:pb-8 md:pl-64 lg:pl-72" style={{ backgroundColor: 'var(--eco-beige)' }}>
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-6 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--eco-navy)' }}>Défis</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCreateModalOpen(true)} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-md flex items-center justify-center" title="Créer un défi">
              <Plus className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--eco-navy)' }} />
            </button>
          </div>
        </motion.div>

        <p className="text-sm md:text-base mb-6" style={{ color: 'var(--eco-text-secondary)' }}>
          Relevez vos défis pour développer votre arbre et gagner des points.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 rounded-full"
              style={{ borderColor: 'var(--eco-green)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* All-done banner */}
              {completedToday === totalChallenges && totalChallenges > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="rounded-3xl p-6 shadow-lg flex flex-col items-center text-center relative overflow-hidden bg-white">
                  <div className="p-3 rounded-2xl mb-4 shadow-sm relative z-10 flex items-center justify-center" style={{ backgroundColor: 'var(--viv-beige)' }}>
                    <TreePine size={32} style={{ color: 'var(--viv-navy)' }} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2 relative z-10" style={{ color: 'var(--viv-navy)' }}>Incroyable ! 🎉</h2>
                  <p className="mb-6 md:text-lg max-w-md relative z-10" style={{ color: 'var(--viv-text-secondary)' }}>Vous avez accompli tous vos défis. La planète vous remercie !</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleUnlockBatch}
                    className="relative z-10 px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: 'var(--viv-navy)', color: 'white' }}>
                    Débloquer de nouveaux défis
                  </motion.button>
                </motion.div>
              )}

              {/* Streak & Points */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2"><Flame className="w-8 h-8 md:w-10 md:h-10 text-orange-500" /></div>
                    <div className="text-3xl md:text-4xl mb-1" style={{ color: 'var(--eco-navy)' }}>{streak}</div>
                    <div className="text-sm md:text-base" style={{ color: '#64748B' }}>Série de jours</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2"><TreePine className="w-8 h-8 md:w-10 md:h-10" style={{ color: 'var(--eco-green)' }} /></div>
                    <div className="text-3xl md:text-4xl mb-1" style={{ color: 'var(--eco-navy)' }}>{totalPoints}</div>
                    <div className="text-sm md:text-base" style={{ color: '#64748B' }}>Points totaux</div>
                  </div>
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-lg p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold md:text-lg" style={{ color: 'var(--eco-navy)' }}>Vos progrès</span>
                  <span className="font-semibold md:text-lg" style={{ color: 'var(--eco-green)' }}>{completedToday}/{totalChallenges}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(125, 217, 179, 0.2)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalChallenges > 0 ? (completedToday / totalChallenges) * 100 : 0}%`, backgroundColor: 'var(--eco-green)' }} />
                </div>
              </motion.div>

              {/* Challenges List */}
              <motion.div id="challenges-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--eco-navy)' }}>Défis à relever</h2>
                <div className="space-y-3">
                  {challenges.map((challenge, index) => (
                    <motion.div key={challenge.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.05 }}
                      onClick={() => toggleChallenge(challenge.id)}
                      className={`bg-white rounded-2xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${challenge.completed ? "opacity-75" : ""}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {challenge.completed
                            ? <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--eco-green)' }} />
                            : <Circle className="w-6 h-6 text-gray-300" />}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium mb-2 ${challenge.completed ? "line-through" : ""}`} style={{ color: challenge.completed ? '#94A3B8' : 'var(--eco-navy)' }}>
                            {challenge.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(125, 217, 179, 0.2)', color: 'var(--eco-navy)' }}>{challenge.category}</span>
                            <span className="font-semibold" style={{ color: 'var(--eco-green)' }}>+{challenge.points} pts</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tree */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-lg p-6 sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-1" style={{ color: 'var(--eco-navy)' }}>Votre arbre grandit</h2>
                    <p className="text-sm md:text-base" style={{ color: '#64748B' }}>{treesPlanted} arbre{treesPlanted > 1 ? "s" : ""} planté{treesPlanted > 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--eco-green)' }}>{treeProgress}%</div>
                    <p className="text-sm" style={{ color: '#64748B' }}>pour le prochain arbre</p>
                  </div>
                </div>
                <div className="relative h-64 md:h-72 rounded-2xl overflow-hidden mb-6 shadow-inner border border-gray-100" style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F2FE)' }}>
                  <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-20 right-10 text-white opacity-80"><Cloud size={48} fill="white" /></motion.div>
                  <motion.div animate={{ x: [20, 0, 20] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} className="absolute top-6 left-6 text-white opacity-60"><Cloud size={40} fill="white" /></motion.div>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 50, ease: "linear" }} className="absolute top-4 right-4"><Sun size={52} className="text-yellow-400" fill="#FBBF24" /></motion.div>
                  <div className="absolute bottom-0 left-0 right-0 h-10 z-10" style={{ background: 'linear-gradient(to bottom, #84CC16, #15803D)' }}><div className="absolute top-0 w-full h-2 bg-green-500 opacity-50 blur-sm" /></div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pb-2">
                    <div className="relative">
                      <TreePine size={220} className="text-white opacity-80" fill="rgba(255,255,255,0.4)" strokeWidth={1} style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }} />
                      <motion.div className="absolute top-0 left-0" initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: `inset(${100 - treeProgress}% 0 0 0)` }} transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}>
                        <TreePine size={220} className="text-emerald-700" fill="#22C55E" strokeWidth={1.5} />
                      </motion.div>
                    </div>
                  </div>
                </div>
                <div className="h-4 rounded-full overflow-hidden border border-gray-100 shadow-inner" style={{ backgroundColor: 'rgba(125, 217, 179, 0.2)' }}>
                  <motion.div className="h-full rounded-full relative overflow-hidden" style={{ backgroundColor: 'var(--eco-green)' }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(3, treeProgress))}%` }} transition={{ duration: 1, type: "spring" }}>
                    <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute top-0 bottom-0 w-1/2 bg-white opacity-20 transform -skew-x-12" />
                  </motion.div>
                </div>
                <div className="mt-5 flex items-center justify-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <span className="font-semibold text-lg" style={{ color: 'var(--eco-navy)' }}>1</span>
                  <TreePine className="w-6 h-6 mx-1" style={{ color: 'var(--eco-green)' }} />
                  <span className="font-semibold text-lg" style={{ color: 'var(--eco-navy)' }}>= 1 000 points</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <CreateChallengeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateChallenge} />
      <Navigation currentPage="challenges" />
    </div>
  );
}