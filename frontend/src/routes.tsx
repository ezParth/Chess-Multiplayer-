import {
    createBrowserRouter,
  } from "react-router-dom";
  
  import App from "./App";
  import Home from "./pages/Home";
  import Login from "./pages/Login";
  import Signup from "./pages/Signup";
  import NotFound from "./pages/NotFound";
  import ChessGame from "./pages/ChessGame";
  
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
          path: "*",
          element: <NotFound />,
        },
        {
          path: "chess/:roomId?",
          element: <ChessGame />,
        },
      ],
    },
  ]);