import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  quizApi, 
  challengesApi, 
  communityApi, 
  friendsApi, 
  userApi
} from './api';

export function useQuizQuestions() {
  return useQuery({
    queryKey: ['quiz', 'questions'],
    queryFn: () => quizApi.getQuestions(),
    staleTime: 60 * 60 * 1000, // 1 hour (static data)
  });
}

export function useChallenges() {
  return useQuery({
    queryKey: ['challenges', 'recommendations'],
    queryFn: () => challengesApi.getRecommendations(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useChallengeToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      challengesApi.toggle(id, { completed }),
    onMutate: async ({ id, completed }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['challenges'] });

      // Snapshot the previous value
      const previousChallenges = queryClient.getQueryData(['challenges', 'recommendations']);

      // Optimistically update to the new value
      queryClient.setQueryData(['challenges', 'recommendations'], (old: any) => {
        if (!old) return old;
        return old.map((c: any) => 
          c.id === id ? { ...c, completed } : c
        );
      });

      // Return a context object with the snapshotted value
      return { previousChallenges };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousChallenges) {
        queryClient.setQueryData(['challenges', 'recommendations'], context.previousChallenges);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct server state
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useCommunityLeaderboard() {
  return useQuery({
    queryKey: ['community', 'leaderboard'],
    queryFn: () => communityApi.getLeaderboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFriends() {
  return useQuery({
    queryKey: ['community', 'friends'],
    queryFn: () => friendsApi.getFriends(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: () => userApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
}
