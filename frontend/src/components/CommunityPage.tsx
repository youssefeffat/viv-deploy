import { useState, useEffect } from "react";
import { Search, Trophy, UserPlus, TreePine, Bell, ChevronRight, UserCheck, UserX, Clock } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Navigation } from "./Navigation";
import { friendsApi, type LeaderboardEntry, type FriendResponse } from "../api";
import { useCommunityLeaderboard, useFriends } from "../hooks";

export function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard, isError: isErrorLeaderboard } = useCommunityLeaderboard();
  const { data: friends = [], isLoading: isLoadingFriends, isError: isErrorFriends, refetch: refetchFriends } = useFriends();
  
  const isLoading = isLoadingLeaderboard || isLoadingFriends;

  useEffect(() => {
    if (isErrorLeaderboard || isErrorFriends) {
      toast.error("Impossible de charger la communauté.");
    }
  }, [isErrorLeaderboard, isErrorFriends]);

  const handleSendRequest = async (friendId: string) => {
    try {
      const res = await friendsApi.sendRequest(friendId);
      toast.success(`Demande envoyée (${res.status})`);
      refetchFriends();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de l'envoi de la demande.");
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      await friendsApi.acceptRequest(friendId);
      toast.success("Demande acceptée !");
      refetchFriends();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de l'acceptation.");
    }
  };

  const handleDeclineRequest = async (friendId: string) => {
    try {
      await friendsApi.declineRequest(friendId);
      toast.info("Demande déclinée.");
      refetchFriends();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors du refus.");
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await friendsApi.removeFriend(friendId);
      toast.info("Ami supprimé.");
      refetchFriends();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la suppression.");
    }
  };

  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const pendingReceived = friends.filter((f) => f.status === "pending_received");

  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  const filteredFriends = searchQuery
    ? acceptedFriends.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : acceptedFriends;

  return (
    <div className="min-h-screen pb-32 md:pb-8 md:pl-64 lg:pl-72" style={{ backgroundColor: 'var(--viv-beige)' }}>
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-6 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--viv-navy)' }}>Rejoindre la communauté</h1>
        </motion.div>

        <p className="text-sm md:text-base mb-6" style={{ color: 'var(--viv-text-secondary)' }}>
          Connectez-vous avec d'autres personnes engagées dans la réduction de leur empreinte carbone.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-4 rounded-full"
              style={{ borderColor: 'var(--viv-secondary)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
            {/* Left Column */}
            <div className="space-y-10 lg:col-span-7">
              {/* Search */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
                  <input type="text" placeholder="Rechercher un ami…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-[20px] focus:outline-none focus:ring-2"
                    style={{ border: '1px solid rgba(30, 41, 59, 0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', '--tw-ring-color': 'var(--viv-red)' } as any} />
                </div>
              </motion.div>

              {/* Pending friend requests */}
              {pendingReceived.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--viv-navy)' }}>
                    <Clock className="w-5 h-5" /> Demandes reçues
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingReceived.length}</span>
                  </h2>
                  <div className="space-y-3">
                    {pendingReceived.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: 'var(--viv-red)' }}>
                          {f.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium" style={{ color: 'var(--viv-navy)' }}>{f.name}</div>
                          <div className="text-xs" style={{ color: '#64748B' }}>{f.points} pts · {f.trees} arbres</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAcceptRequest(f.id)} className="p-2 rounded-xl text-white" style={{ backgroundColor: 'var(--viv-secondary)' }} title="Accepter">
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeclineRequest(f.id)} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors" title="Décliner">
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Friends list */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--viv-navy)' }}>Vos amis</h2>
                </div>

                {filteredFriends.length === 0 ? (
                  <p className="text-sm" style={{ color: '#64748B' }}>
                    {searchQuery ? "Aucun ami trouvé pour cette recherche." : "Vous n'avez pas encore d'amis. Ajoutez-en depuis le classement !"}
                  </p>
                ) : (
                  <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-2">
                    {filteredFriends.map((friend) => (
                      <div key={friend.id} className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="relative group">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-semibold text-lg" style={{ backgroundColor: 'var(--viv-red)' }}>
                            {friend.avatar}
                          </div>
                          <button onClick={() => handleRemoveFriend(friend.id)} className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" title="Supprimer l'ami">
                            <UserX className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        <span className="text-xs font-medium text-center" style={{ color: 'var(--viv-navy)' }}>{friend.name.split(" ")[0]}</span>
                        <span className="text-xs" style={{ color: '#64748B' }}>{friend.points} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Leaderboard */}
            <div className="lg:col-span-5">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-6 h-6" style={{ color: 'var(--viv-secondary)' }} />
                  <h2 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--viv-navy)' }}>Classement</h2>
                </div>

                {topThree.length >= 3 && (
                  <div className="flex items-end justify-center gap-6 mb-10">
                    {/* 2nd */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-semibold border-[6px]" style={{ backgroundColor: 'var(--viv-red)', borderColor: '#e5e7eb' }}>{topThree[1].avatar}</div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ backgroundColor: '#e5e7eb', color: 'var(--viv-navy)' }}>🥈</div>
                      </div>
                      <div className="text-xs font-medium text-center" style={{ color: 'var(--viv-navy)' }}>{topThree[1].name.split(' ')[0]}</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>{topThree[1].points} pts</div>
                    </div>
                    {/* 1st */}
                    <div className="flex flex-col items-center -mt-4">
                      <div className="relative mb-2">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-white font-semibold text-lg border-[6px]" style={{ backgroundColor: 'var(--viv-red)', borderColor: '#fbbf24' }}>{topThree[0].avatar}</div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ backgroundColor: '#fbbf24', color: 'white' }}>🏆</div>
                      </div>
                      <div className="text-sm font-semibold text-center" style={{ color: 'var(--viv-navy)' }}>{topThree[0].name.split(' ')[0]}</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>{topThree[0].points} pts</div>
                    </div>
                    {/* 3rd */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-semibold border-[6px]" style={{ backgroundColor: 'var(--viv-red)', borderColor: '#d97706' }}>{topThree[2].avatar}</div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ backgroundColor: '#d97706', color: 'white' }}>🥉</div>
                      </div>
                      <div className="text-xs font-medium text-center" style={{ color: 'var(--viv-navy)' }}>{topThree[2].name.split(' ')[0]}</div>
                      <div className="text-xs" style={{ color: '#64748B' }}>{topThree[2].points} pts</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {restOfLeaderboard.map((user) => (
                    <div key={user.rank} className="flex items-center gap-4 p-4 rounded-[20px]" style={{ backgroundColor: '#f8fafc' }}>
                      <div className="w-8 text-center font-semibold" style={{ color: '#64748B' }}>{user.rank}</div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: 'var(--viv-red)' }}>{user.avatar}</div>
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--viv-navy)' }}>{user.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--viv-secondary)' }}>{user.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <Navigation currentPage="community" />
    </div>
  );
}
