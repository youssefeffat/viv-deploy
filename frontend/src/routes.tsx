import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { QuizPage } from "./components/QuizPage";
import { PredictionPage } from "./components/PredictionPage";
import { ResultPage } from "./components/ResultPage";
import { SignupPage } from "./components/SignupPage";
import { LoginPage } from "./components/LoginPage";
import { DashboardPage } from "./components/DashboardPage";
import { ProfilePage } from "./components/ProfilePage";
import { ChallengesPage } from "./components/ChallengesPage";
import { CommunityPage } from "./components/CommunityPage";
import { NotFound } from "./components/NotFound";
import { PrivateRoute } from "./auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/quiz",
    Component: QuizPage,
  },
  {
    path: "/prediction",
    Component: PredictionPage,
  },
  {
    path: "/result",
    Component: ResultPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    element: <PrivateRoute Component={DashboardPage} />,
  },
  {
    path: "/profile",
    element: <PrivateRoute Component={ProfilePage} />,
  },
  {
    path: "/challenges",
    element: <PrivateRoute Component={ChallengesPage} />,
  },
  {
    path: "/community",
    element: <PrivateRoute Component={CommunityPage} />,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
