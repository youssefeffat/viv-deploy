/**
 * Viveris Carbone — Central API Client
 *
 * All HTTP calls go through `apiFetch`. Authenticated endpoints automatically
 * attach the stored Bearer token. Token helpers are exported so components
 * can clear or read the token without touching localStorage keys directly.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ─── Token helpers ─────────────────────────────────────────────────────────

const TOKEN_KEY = "viv_access_token";
const USER_KEY = "viv_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setStoredUser(user: UserObject): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): UserObject | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // If the server says we're unauthorized, clear stored credentials
    // so the UI can react (e.g. redirect to login).
    if (response.status === 401 || response.status === 403) {
      clearToken();
    }

    let errorMessage = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) {
        if (typeof body.detail === "string") {
          errorMessage = body.detail;
        } else if (Array.isArray(body.detail)) {
          // FastAPI validation errors
          errorMessage = body.detail.map((e: any) => e.msg).join(", ");
        } else if (typeof body.detail === "object" && body.detail.message) {
          errorMessage = body.detail.message;
        } else {
          errorMessage = "Une erreur est survenue (détails techniques masqués).";
        }
      } else if (body?.message) {
        errorMessage =
          typeof body.message === "string"
            ? body.message
            : "Une erreur inattendue est survenue.";
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  // Some endpoints return empty body on success
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return {} as T;
}

// ─── Schema types (mirroring openapi.json) ─────────────────────────────────

export interface SignUpRequest {
  email: string;
  password: string;
  user_name: string;
}

export interface SignUpResponse {
  id: string;
  email: string;
  user_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UserObject {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  userName?: string | null;
}

export interface QuizResult {
  totalInTons: number;
  categoryBreakdown: Record<string, number>;
}

export interface Achievement {
  id: string;
  name: string;
  unlocked: boolean;
}

export interface UserProfileDashboardResponse {
  user: UserObject;
  quizResult: QuizResult | null;
  categoryEmissions: Record<string, number> | null;
  points: number;
  treesPlanted: number;
  achievements: Achievement[];
  streak: number;
  bestStreak: number;
  history?: any[];
}

export interface GenericActionResponse {
  success: boolean;
  message: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdvancedUserStatsResponse {
  co2ThisYear: number;
  co2LastYear: number | null;
  co2ReducedThisYear: number;
  challengesCompleted: number;
  bestStreak: number;
  currentStreak: number;
  badges: string[];
}

export interface QuizOption {
  label: string;
  value: number;
  co2: number;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: QuizOption[];
}

export interface AnswerItem {
  label: string;
  value: number;
  co2: number;
}

export interface QuizResultPayload {
  totalInTons: string | number;
  answers: Record<string, AnswerItem>;
}

export interface UserPredictions {
  highestConsumption?: string[] | null;
  flexibility: string[];
}

export interface EmissionsSaveRequest {
  quizResult: QuizResultPayload;
  userPredictions: UserPredictions;
}

export interface EmissionsSaveResponse {
  success: boolean;
  emissionId: string;
  quizResult: QuizResult;
  categoryEmissions: Record<string, number>;
  targetCO2: number;
  savedAt: string;
}

export interface CategoryUpdateRequest {
  category: string;
  answers: Record<string, AnswerItem>;
}

export interface CategoryUpdateResponse {
  success: boolean;
  category: string;
  newCategoryTotal: number;
  categoryEmissions: Record<string, number>;
  updatedTotalInTons: number;
  savedAt: string;
}

export interface ChallengeResponse {
  id: string;
  title: string;
  points: number;
  category: string;
  completed: boolean;
}

export interface ToggleChallengeRequest {
  completed: boolean;
}

export interface ToggleChallengeResponse {
  success: boolean;
  challengeId: string;
  completed: boolean;
  pointsDelta: number;
  totalPoints: number;
  treesPlanted: number;
  treeProgress: number;
}

export interface CreateChallengeRequest {
  title: string;
  category: string;
  points: number;
}

export interface CreateChallengeResponse {
  success: boolean;
  challenge: Record<string, unknown>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  trees: number;
  percentage: number;
}

export interface FriendResponse {
  id: string;
  name: string;
  avatar: string;
  points: number;
  trees: number;
  status: string; // "accepted" | "pending_sent" | "pending_received"
}

export interface FriendActionResponse {
  success: boolean;
  status: string;
  friendId: string;
  totalFriends: number;
}

// ─── Auth endpoints ─────────────────────────────────────────────────────────

export const authApi = {
  signup(data: SignUpRequest): Promise<SignUpResponse> {
    return apiFetch<SignUpResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout(): Promise<LogoutResponse> {
    return apiFetch<LogoutResponse>("/auth/logout", { method: "POST" });
  },
};

// ─── User endpoints ─────────────────────────────────────────────────────────

export const userApi = {
  getMe(): Promise<UserProfileDashboardResponse> {
    return apiFetch<UserProfileDashboardResponse>("/api/users/me");
  },

  deleteMe(hard = false): Promise<GenericActionResponse> {
    return apiFetch<GenericActionResponse>(
      `/api/users/me?hard=${hard}`,
      { method: "DELETE" }
    );
  },

  changePassword(data: PasswordChangeRequest): Promise<GenericActionResponse> {
    return apiFetch<GenericActionResponse>("/api/users/me/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getStats(): Promise<AdvancedUserStatsResponse> {
    return apiFetch<AdvancedUserStatsResponse>("/api/users/me/stats");
  },
};

// ─── Quiz & Emissions endpoints ─────────────────────────────────────────────

export const quizApi = {
  getQuestions(): Promise<QuizQuestion[]> {
    return apiFetch<QuizQuestion[]>("/api/quiz/questions");
  },
};

export const emissionsApi = {
  save(data: EmissionsSaveRequest): Promise<EmissionsSaveResponse> {
    return apiFetch<EmissionsSaveResponse>("/api/emissions/save", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCategory(data: CategoryUpdateRequest): Promise<CategoryUpdateResponse> {
    return apiFetch<CategoryUpdateResponse>("/api/emissions/category", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ─── Challenges endpoints ───────────────────────────────────────────────────

export const challengesApi = {
  getRecommendations(): Promise<ChallengeResponse[]> {
    return apiFetch<ChallengeResponse[]>("/api/challenges/recommendations");
  },

  toggle(
    challengeId: string,
    data: ToggleChallengeRequest
  ): Promise<ToggleChallengeResponse> {
    return apiFetch<ToggleChallengeResponse>(
      `/api/challenges/${challengeId}/toggle`,
      { method: "POST", body: JSON.stringify(data) }
    );
  },

  create(data: CreateChallengeRequest): Promise<CreateChallengeResponse> {
    return apiFetch<CreateChallengeResponse>("/api/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  unlockBatch(): Promise<{ success: boolean; newOffset: number; challenges: ChallengeResponse[] }> {
    return apiFetch<{ success: boolean; newOffset: number; challenges: ChallengeResponse[] }>("/api/challenges/unlock-batch", {
      method: "POST",
    });
  },
};

// ─── Community endpoints ────────────────────────────────────────────────────

export const communityApi = {
  getLeaderboard(): Promise<LeaderboardEntry[]> {
    return apiFetch<LeaderboardEntry[]>("/api/community/leaderboard");
  },
};

// ─── Friends endpoints ──────────────────────────────────────────────────────

export const friendsApi = {
  getFriends(): Promise<FriendResponse[]> {
    return apiFetch<FriendResponse[]>("/api/users/me/friends");
  },

  sendRequest(friendId: string, message?: string): Promise<FriendActionResponse> {
    return apiFetch<FriendActionResponse>(
      `/api/users/${friendId}/friends`,
      {
        method: "POST",
        body: JSON.stringify({ message: message ?? null }),
      }
    );
  },

  removeFriend(friendId: string): Promise<FriendActionResponse> {
    return apiFetch<FriendActionResponse>(
      `/api/users/${friendId}/friends`,
      { method: "DELETE" }
    );
  },

  acceptRequest(friendId: string): Promise<FriendActionResponse> {
    return apiFetch<FriendActionResponse>(
      `/api/users/${friendId}/friends/accept`,
      { method: "POST", body: JSON.stringify(null) }
    );
  },

  declineRequest(friendId: string): Promise<FriendActionResponse> {
    return apiFetch<FriendActionResponse>(
      `/api/users/${friendId}/friends/decline`,
      { method: "POST", body: JSON.stringify(null) }
    );
  },
};
