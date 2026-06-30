import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { Chess } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import toast from "react-hot-toast";

export default function Home() {
  const [username] = useState<string | null>(() =>
    localStorage.getItem("username")
  );
  const [challengingUsers, setChallengingUsers] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const nav = useNavigate()

  // Chess board
  const gameRef = useRef(new Chess());
  const [position, setPosition] = useState(gameRef.current.fen());

  const onDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    console.log("move")
    if(!targetSquare) return
    const move = gameRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false;

    setPosition(gameRef.current.fen());
    return true;
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    const username = localStorage.getItem("username");

    if (username) {
      socket.on("connect", () => {
        socket.emit("register", username);
      });
    }

    const acceptChallange = (player: string) => {
      socketRef.current?.emit("accept-challenge", {
        from: player,
        myName: username ?? localStorage.getItem("username"),
      });
  
      nav(`/friend/${player}`);
    }


    socket.on("challenging", ({ from }) => {
      setChallengingUsers((prev) => [...prev, from]);
    
      toast.custom((t) => (
        <div className="bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 p-4 w-80">
          <p className="font-semibold">
            ♟ <span className="text-blue-400">{from}</span> challenged you!
          </p>
    
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
              onClick={() => {
                toast.dismiss(t.id);
    
                socketRef.current?.emit("decline-challenge", {
                  from,
                  myName: username,
                });
              }}
            >
              Decline
            </button>
    
            <button
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700"
              onClick={() => {
                toast.dismiss(t.id);
    
                acceptChallange(from);
              }}
            >
              Accept
            </button>
          </div>
        </div>
      ));
    });


    return () => {
      socket.disconnect();
    };
  }, []);



  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <h1 className="text-3xl font-bold">♟ Chess App</h1>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-400 transition">
            Home
          </Link>

          <Link to="/chess" className="hover:text-blue-400 transition">
            Chess
          </Link>

          {!username ? (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-blue-400 transition">
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Signup
              </Link>
            </div>
          ) : (
            <Link
              to="/profile"
              className="font-semibold hover:text-blue-400 transition"
            >
              {username}
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
          {/* Left Side */}
          <div className="flex-1">
            <h1 className="text-6xl font-extrabold leading-tight">
              Play Chess
              <span className="block text-blue-500">Anywhere.</span>
            </h1>

            <p className="mt-6 text-slate-400 text-lg max-w-xl leading-8">
              Challenge your friends, improve your rating, and enjoy beautiful
              online chess. Play casual games, save your matches, and compete
              against players from around the world.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/chess"
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                ▶ Play Now
              </Link>

              <Link
                to="/signup"
                className="border border-slate-700 hover:bg-slate-900 px-6 py-3 rounded-lg transition"
              >
                Create Account
              </Link>

              <Link
                to="/friend"
                className="border border-slate-700 hover:bg-slate-900 px-6 py-3 rounded-lg transition"
              >
                Play a Friend
              </Link>

              <Link
                to="/savedGames"
                className="border border-slate-700 hover:bg-slate-900 px-6 py-3 rounded-lg transition"
              >
                Saved Games
              </Link>

              <Link
                to="/liveGames"
                className="border border-slate-700 hover:bg-slate-900 px-6 py-3 rounded-lg transition"
              >
                Live Games
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-blue-900/30">
              <Chessboard
              options={{
                id: "HomeChessboard",
                position: position,
                onPieceDrop: onDrop,
                boardWidth: "520",
                boardStyle: {
                  borderRadius: "12px",
                  boxShadow: "0 0 25px rgba(0,0,0,0.5)",
                },
                lightSquareStyle: { backgroundColor: "#f0d9b5" },
                darkSquareStyle: { backgroundColor: "#b58863" },
              }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}