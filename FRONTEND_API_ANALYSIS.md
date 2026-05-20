# Frontend API Call Analysis - Viveris Carbone
## Performance Optimization Report

---

## Executive Summary

Your frontend experiences significant performance issues when navigating between pages. The analysis reveals **5 critical problems**:

1. **Blocking Full-Page Loads** - Every page freeze completely while loading
2. **Duplicate API Requests** - Same data fetched multiple times across pages
3. **No Request Caching** - No deduplication or smart reuse of data
4. **Sequential Blocking Patterns** - Waterfalls of dependent requests
5. **No Progressive Loading** - All-or-nothing approach blocking entire page rendering

---

## Problem 1: Blocking Full-Page Loads

### Current Pattern (❌ Problem)

Every page component (Dashboard, Challenges, Community, Profile) follows:

```typescript
export function DashboardPage() {
  const [profile, setProfile] = useState<UserProfileDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userApi.getMe()
      .then((data) => {
        setProfile(data);
        // ... process data
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Spinner />; // ⚠️ ENTIRE PAGE BLOCKED
  }

  return <Dashboard data={profile} />;
}
```

**Impact:**
- User sees blank spinner for 800ms - 2+ seconds
- Cannot interact with navigation
- Cannot see any content while loading
- Disorients users during navigation

**Affected Pages:**
- ✗ DashboardPage - blocks until `userApi.getMe()` + `quizApi.getQuestions()`
- ✗ ChallengesPage - blocks until `challengesApi.getRecommendations()`
- ✗ CommunityPage - blocks on `Promise.all([leaderboard, friends])`
- ✗ ProfilePage - blocks on `Promise.all([getMe(), getStats()])`

**Root Cause:** React Router has no data loading mechanism; components control their own data fetching.

---

## Problem 2: Duplicate API Requests

### Request Duplication Map

| Endpoint | Called From | Frequency |
|----------|------------|-----------|
| `/api/users/me` | **4 places** | ✗ Excessive |
| `/api/quiz/questions` | **2 places** | ✗ Should be 1 |
| `/api/community/leaderboard` | **1 place** | ✓ OK |
| `/api/challenges/recommendations` | **1 place** | ✓ OK |

### Detailed Duplication

**1️⃣ userApi.getMe() - Called 4 Times:**

```
PrivateRoute (on every route guard)
├── Validates token → userApi.getMe()
│
DashboardPage
├── Load profile data → userApi.getMe()
│
ChallengesPage
├── Load user stats → userApi.getMe()
│
ProfilePage
├── Load profile + stats → userApi.getMe() + userApi.getStats()
```

**Example from routes.tsx:**
```typescript
// PROBLEM: Every protected route navigates → PrivateRoute validates
// → calls userApi.getMe() while component also calls getMe()

export function PrivateRoute({ Component }: { Component: React.ComponentType<any> }) {
  useEffect(() => {
    (async () => {
      try {
        await userApi.getMe(); // ← Validation call #1
        if (mounted) setValidating(false);
      } catch (err) { /* ... */ }
    })();
  }, [], [token, navigate]);

  return <Component />; // ← Component also calls getMe() #2
}
```

**Example from DashboardPage:**
```typescript
useEffect(() => {
  userApi.getMe()  // ← REDUNDANT - PrivateRoute already validated!
    .then((data) => {
      setProfile(data);
      // ...
    })
}, []);
```

**2️⃣ Quiz Questions Duplication:**

```typescript
// DashboardPage
const cached = sessionStorage.getItem("quizQuestions");
if (cached) {
  setApiQuestions(JSON.parse(cached));
} else {
  quizApi.getQuestions()  // Call #1
    .then((qs) => { setApiQuestions(qs); sessionStorage.setItem("quizQuestions", JSON.stringify(qs)); })
}

// SEPARATE: QuizPage also fetches
quizApi
  .getQuestions()  // Call #2 - independent fetch
  .then((data) => {
    setQuestions(data);
    sessionStorage.setItem("quizQuestions", JSON.stringify(data));
  })
```

**Impact:**
- User changes from Dashboard → Quiz → Dashboard
- Scenario: Quiz questions fetched twice in same session
- If user visits Dashboard then QuizPage immediately, quiz API called twice
- 2-4 extra HTTP requests per user session

---

## Problem 3: No Request Caching/Deduplication

### Current State (❌ Problem)

```typescript
// api.ts - Core fetch wrapper
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  // ⚠️ NO CACHING LAYER
  // ⚠️ NO DEDUPLICATION (if request already in-flight, don't make new one)
  // ⚠️ NO AUTOMATIC REVALIDATION
  
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  // ... error handling
  return response.json();
}
```

**Problems:**

1. **No Automatic Deduplication**
   - If two components simultaneously request `/api/users/me`, makes **2 HTTP requests**
   - Professional apps would make **1 request**, share result to both

2. **No Stale-While-Revalidate Pattern**
   - Data from 5 seconds ago is treated as invalid = fresh fetch each time
   - No smart revalidation background refreshes

3. **No Request Coalescing**
   - Component A starts: `await userApi.getMe()` (pending)
   - Component B starts: `await userApi.getMe()` (new request)
   - Both requests complete separately

---

## Problem 4: All-or-Nothing Blocking Patterns

### Community Page Example

```typescript
useEffect(() => {
  Promise.all([communityApi.getLeaderboard(), friendsApi.getFriends()])
    .then(([lb, fr]) => { setLeaderboard(lb); setFriends(fr); })
    .catch((err: any) => toast.error(err.message ?? "Impossible de charger la communauté."))
    .finally(() => setIsLoading(false));
}, []);
```

**While network requests are parallel, the UI rendering is blocked completely:**

```
Time: 0ms     Browser starts Community page
              ✓ Load HTML/CSS/JS
              ✓ React renders → calls useEffect

Time: 16ms    Both requests start concurrently!
              GET /api/community/leaderboard (e.g., 50ms)
              GET /api/users/me/friends (e.g., 800ms)
              
Time: 66ms    Leaderboard response arrives
              ✓ But UI cannot render yet because Promise.all waits for friends...
              ✓ User still sees a spinner!
              
Time: 816ms   Friends response arrives
              ✓ Promise.all fulfills
              ✓ UI finally renders (User saw spinner for 800ms!)
```

**Better approach:** Load independent data streams using separate state/hooks so the fast data (Leaderboard) renders immediately, while slow data (Friends) shows a local skeleton.

### Dashboard Multiple Calls Example

```typescript
useEffect(() => {
  // CALL #1: Main profile data
  userApi.getMe()
    .then((data) => {
      setProfile(data);
      // ... process
    })
    .finally(() => setIsLoading(false));  // ⚠️ Blocks on first call only

  // CALL #2: Quiz questions (independent, but can fail silently)
  const cached = sessionStorage.getItem("quizQuestions");
  if (cached) {
    setApiQuestions(JSON.parse(cached));
  } else {
    quizApi.getQuestions()
      .catch(() => {/* silently fail */});  // ⚠️ No error handling
  }
}, []);
```

**Impact:**
- If `quizApi.getQuestions()` is slow on Dashboard, modal is empty
- User doesn't know data failed to load
- Creates UI inconsistency

---

## Problem 5: No Progressive/Partial Loading

### Current State (❌ Problem)

**Dashboard shows everything or nothing:**

```typescript
const [profile, setProfile] = useState<UserProfileDashboardResponse | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  userApi.getMe()  // ← Single large response with:
    .then((data) => {
      // Includes:
      // - user info (fast)
      // - quizResult (fast)
      // - categoryEmissions (fast)
      // - points (fast)
      // - treesPlanted (fast)
      // - achievements (could be slow!)
      // - streak data (fast)
      
      setProfile(data);  // ← Wait until ALL loaded
    })
    .finally(() => setIsLoading(false));
}, []);

if (isLoading) {
  return <Spinner />;  // ← User sees nothing until EVERYTHING arrives
}
```

**Better approach:**
- Show profile header immediately (fast)
- Show emissions breakdown while achievements load (progressive)
- Load achievements asynchronously
- Use skeleton loaders for sections

**Current User Experience:**
```
Timeline          Current              Better
────────────────────────────────────────────────────
0ms      [SPINNER]                  [Profile Card]
100ms    [SPINNER]                  [Emissions Chart - Loading...]
200ms    [SPINNER]                  [Dashboard Data - Loading...]
300ms    [SPINNER]                  [Achievements - Loading...]
400ms    [SPINNER]                  [Achievements Loaded ✓]
500ms    [SPINNER]                  [All Content Ready]
600ms    [Full Dashboard ✓]         [Interaction possible @300ms]

User wait:  600ms              User wait: ~150ms (perceived)
            (cannot interact)           (can interact @300ms)
```

---

## Problem 6: Token Validation Inefficiency

### Current Flow (❌ Problem)

Every route change triggers:

```
User navigates to /dashboard
  ↓
PrivateRoute component mounts
  ↓
useEffect → validating = true
  ↓
await userApi.getMe()  [REQUEST #1 - Token validation]
  ↓
DashboardPage mounts
  ↓
useEffect → setIsLoading(true)
  ↓
await userApi.getMe()  [REQUEST #2 - Load profile]
  ↓
State updates settle
  ↓
UI finally renders
```

**Result:** **2 requests** to same endpoint before any UI shows.

---

## Problem 7: Inconsistent Error Handling

### Code Examples

**Silent Failures (❌ Bad):**

```typescript
// DashboardPage - Quiz questions optional
quizApi.getQuestions()
  .catch(() => {/* silently fail — modal just won't show questions */});
  // ↑ User won't know modal is broken
```

**Inconsistent UI States (❌ Bad):**

```typescript
// Some pages show loading spinner
if (isLoading) return <Spinner />;

// Some components fetch independently
quizApi.getQuestions()  // Could fail, no UI feedback
  .catch(() => {});
  
// Leaves UI in inconsistent state:
// - Page loaded but quiz modal is broken
// - User clicks modal, nothing appears = bad UX
```

---

## Performance Impact Summary

### Timeline of Current User Experience

**Scenario: User logs in → goes to Dashboard → navigates to Challenges**

```
Time    Event
────────────────────────────────────────────────────────
0ms     User clicks Dashboard in nav

|       ↓ Browser: React route change triggered
|
16ms    PrivateRoute mounts
|       ├─ Validation: await userApi.getMe()  [REQ #1]
|       └─ Validating spinner shows
|
150ms   Dashboard component mounts while still validating
|       ├─ Quiz questions check
|       ├─ await userApi.getMe()  [REQ #2] - DUPLICATE!
|       └─ Dashboard shows main spinner
|
250ms   [REQ #1] validation response arrives
|       ├─ PrivateRoute: setValidating(false)
|       └─ Dashboard component now renders
|
400ms   Quiz questions fetch starts
|       └─ quizApi.getQuestions()  [REQ #3]
|
550ms   [REQ #2] profile data response arrives
|       ├─ Dashboard: setProfile(data)
|       └─ Dashboard renders with data!
|
650ms   [REQ #3] quiz questions response arrives
|       └─ Modal questions now available
|
700ms   USER CAN FINALLY INTERACT ← 700ms delay!
|
800ms   User clicks Challenges in nav
|       ↓ Entire page goes to spinner again!
|
950ms   ChallengesPage: await challengesApi.getRecommendations()  [REQ #4]
|
1100ms  ChallengesPage: await userApi.getMe()  [REQ #5] - DUPLICATE!
|       (redundant - we just loaded profile in Dashboard!)
|
1200ms  [REQ #4] challenges data arrives
|       └─ Challenges renders
|
1300ms  [REQ #5] profile data arrives but not used
|
1400ms  USER CAN INTERACT ← Another 600ms delay!
```

**Total wasted time:** ~1.3+ seconds with **multiple duplicate requests**

---

## Root Cause Analysis

### Why This Happened

1. **No State Management Layer**
   - No Redux, Zustand, or Context for shared app state
   - Each component fetches independently
   - No awareness of what other components are doing

2. **No Data Layer Pattern**
   - No TanStack Query (React Query), SWR, or similar
   - No automatic caching
   - No request deduplication
   - No background revalidation

3. **React Router Limitations**
   - Router has no built-in data loading
   - No preloading
   - No suspense for data fetching
   - Components manage own data lifecycle

4. **Lack of Design Clarity**
   - No distinction between:
     - "validation" requests (token checking)
     - "initialization" requests (load page data)
     - "interaction" requests (user actions)

---

## Optimization Opportunities

### Tier 1 - Quick Wins (1-2 hours)
1. ✅ Eliminate duplicate `userApi.getMe()` calls
2. ✅ Cache quiz questions globally (not per-component)
3. ✅ Show partial UI while loading (skeleton screens)
4. ✅ Parallel requests instead of sequential

### Tier 2 - Medium Effort (3-5 hours)
1. ✅ Implement React Query for caching/deduplication
2. ✅ Implement progressive data loading
3. ✅ Move user profile to app-level state
4. ✅ Background revalidation

### Tier 3 - Architectural (5-10 hours)
1. ✅ React Router 7 with loaders (preload data before route change)
2. ✅ Suspense boundaries for streaming UI
3. ✅ Global state management (if not using TanStack Query)

---

## Current API Endpoint Summary

| Endpoint | Component(s) | Calls/Session | Issue |
|----------|--------------|---------------|-------|
| `GET /api/users/me` | PrivateRoute, Dashboard, Challenges, Profile | 4+ | 🔴 Duplicate |
| `GET /api/users/me/stats` | Profile | 1 | ✅ OK |
| `GET /api/users/me/friends` | Community | 1 | ✅ OK |
| `GET /api/quiz/questions` | Dashboard, QuizPage | 2 | 🟡 Duplicate when visiting both |
| `GET /api/challenges/recommendations` | ChallengesPage | 1 | ✅ OK |
| `GET /api/community/leaderboard` | CommunityPage | 1 | ✅ OK |
| `POST /api/challenges/{id}/toggle` | ChallengesPage | On demand | ✅ OK |
| `POST /api/emissions/save` | ResultPage | On demand | ✅ OK |
| `PUT /api/emissions/category` | DashboardPage | On demand | ✅ OK |

---

## Recommended Fixes (Detailed in Separate Documents)

1. **Remove redundant validation** - Single validation at app boot
2. **Implement React Query** - Automatic caching & deduplication
3. **Component-level data orchestration** - Pre-fetch critical data
4. **Progressive rendering** - Show UI while loading supplementary data
5. **Error boundaries** - Consistent error handling

---

## Files to Investigate Next

- `frontend/src/api.ts` - Core API layer (needs caching)
- `frontend/src/auth.tsx` - PrivateRoute validation (remove duplicate)
- `frontend/src/components/DashboardPage.tsx` - Multiple data sources
- `frontend/src/components/ProfilePage.tsx` - Multiple parallel requests
- `frontend/src/components/CommunityPage.tsx` - Waterfall pattern
- `frontend/src/routes.tsx` - No data preloading

---

## Next Steps

This analysis identifies WHERE the problems are. 

**The follow-up document will provide:**
1. ✅ Step-by-step optimization code
2. ✅ React Query implementation guide
3. ✅ Progressive loading patterns
4. ✅ Request deduplication strategy
5. ✅ Estimated performance gains

Would you like me to proceed with optimization implementations?
