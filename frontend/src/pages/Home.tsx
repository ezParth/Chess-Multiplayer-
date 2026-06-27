import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  // const [username, setUsername] = useState<string | null>(null)
  const [username] = useState<string | null>(() =>
    localStorage.getItem("username")
  );
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold">Chess App</h1>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-400 transition">
            Home
          </Link>

          <Link to="/chess" className="hover:text-blue-400 transition">
            Chess
          </Link>
          {!username && (
            <div>
              <Link to="/login" className="hover:text-blue-400 transition">
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Signup
              </Link>
            </div>
          )}
          {username && (
            <div>
              <Link to="/profile" className="hover:text-blue-400 transition">
                {username}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center mt-32 px-4">
        <h1 className="text-6xl font-bold mb-6">Play Chess Online</h1>

        <p className="text-slate-400 text-lg max-w-2xl">
          Challenge friends, improve your rating, and play chess in real time
          with players around the world.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            to="/chess"
            className="bg-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
          >
            Play Now
          </Link>

          <Link
            to="/signup"
            className="border border-slate-700 px-6 py-3 rounded-lg hover:bg-slate-900"
          >
            Create Account
          </Link>

          <Link
            to="/friend"
            className="border border-slate-700 px-6 py-3 rounded-lg hover:bg-slate-900"
          >
            Play a Friend
          </Link>
          <Link
            to="/savedGames"
            className="border border-slate-700 px-6 py-3 rounded-lg hover:bg-slate-900"
          >
            Saved Games
          </Link>
        </div>
      </div>
    </div>
  );
}
