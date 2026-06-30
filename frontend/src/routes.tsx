import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
// import ChessGame from "./pages/ChessGame";
import ProtectedRoute from "./pages/ProtectedRoutes";
import SavedGames from "./pages/SavedGames";
import AllPlayers from "./pages/AllPlayers";
// import PlayAFriend from "./pages/PlayAFriend";
import GameLayout from "./pages/GameLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "chess/:roomId?",
            element: <GameLayout />,
          },
        ],
      },
      // {
      //   element: <ProtectedRoute />,
      //   children: [
      //     {
      //       path: "chess/:roomId?",
      //       element: <ChessGame />,
      //     },
      //   ],
      // },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/savedGames",
            element: <SavedGames />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/friend",
            element: <AllPlayers />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/friend/:friendName",
            element: <GameLayout />,
          },
        ],
      },
      //   element: <ProtectedRoute />,
      //   children: [
      //     {
      //       path: "/friend/:friendName",
      //       element: <PlayAFriend />,
      //     },
      //   ],
      // },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
