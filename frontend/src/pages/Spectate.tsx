import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function Spectate() {
  const { roomId } = useParams();

  const socketRef = useRef<Socket | null>(null);

  const [game] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [white, setWhite] = useState("")
  const [black, setBlack] = useState("")

  interface ISpectateObject {
    roomId: string;
    white: string;
    black: string;
    fen: string;
  }

  useEffect(() => {
    if (!roomId) return;

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to spectate");

      socket.emit("get-all-games");
    });

    socket.on(roomId, (newFen: string) => {
      try {
        game.load(newFen);
        setFen(newFen);
      } catch (err) {
        console.error("Invalid FEN:", err);
      }
    });

    socket.on("get-games", (games: ISpectateObject[]) => {
        games.map((g) => {
            if(g.roomId == roomId) {
                setFen(g.fen)
                setWhite(g.white)
                setBlack(g.black)
                game.load(g.fen)
            }
        })
      });

    return () => {
      socket.off(roomId);
      socket.disconnect();
    };
  }, [roomId, game]);

return (
  <div className="min-h-screen bg-slate-950 text-white px-8 py-8">
    <h1 className="text-4xl font-bold text-center mb-10">
      Spectating Live Game
    </h1>

    <div className="flex justify-center gap-10">
      {/* Left Panel */}
      <div className="w-72 flex flex-col gap-6">
        {/* Black */}
        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-black border-2 border-slate-600 flex items-center justify-center text-2xl font-bold">
              {black ? black.charAt(0).toUpperCase() : "?"}
            </div>

            <div>
              <p className="text-xl font-bold">{black || "Loading..."}</p>
              <p className="text-slate-400">Playing Black</p>
            </div>
          </div>
        </div>

        {/* White */}
        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white text-black border-2 border-slate-300 flex items-center justify-center text-2xl font-bold">
              {white ? white.charAt(0).toUpperCase() : "?"}
            </div>

            <div>
              <p className="text-xl font-bold">{white || "Loading..."}</p>
              <p className="text-slate-400">Playing White</p>
            </div>
          </div>
        </div>

        {/* Room */}
        <div className="bg-slate-900 rounded-2xl p-5 shadow-xl border border-slate-800">
          <h2 className="font-bold text-lg mb-2">Room</h2>

          <p className="font-mono text-sm break-all text-slate-300">
            {roomId}
          </p>
        </div>
      </div>

      {/* Chess Board */}
      <div className="bg-slate-900 w-[600px] rounded-2xl p-6 shadow-2xl border border-slate-800">
        <Chessboard
          options={{
            position: fen,
            allowDragging: false,
            boardStyle: {
              borderRadius: "12px",
              boxShadow: "0 0 30px rgba(0,0,0,0.5)",
            },
            lightSquareStyle: {
              backgroundColor: "#f0d9b5",
            },
            darkSquareStyle: {
              backgroundColor: "#b58863",
            },
          }}
        />
      </div>

      {/* Right Panel */}
      <div className="w-72">
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800">
          <h2 className="text-xl font-bold mb-6">
            Navigation
          </h2>

          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 rounded-lg py-3 text-center font-semibold transition"
            >
              Home
            </Link>

            <Link
              to="/chess"
              className="bg-green-600 hover:bg-green-700 rounded-lg py-3 text-center font-semibold transition"
            >
              Play Chess
            </Link>

            <Link
              to="/live-games"
              className="bg-yellow-600 hover:bg-yellow-700 rounded-lg py-3 text-center font-semibold transition"
            >
              Live Games
            </Link>

            <Link
              to="/friend"
              className="bg-pink-600 hover:bg-yellow-700 rounded-lg py-3 text-center font-semibold transition"
            >
              Play A Friend
            </Link>
          </div>

          <div className="mt-8 border-t border-slate-700 pt-6">
            <h3 className="font-semibold mb-2">
              Spectator Mode
            </h3>

            <p className="text-slate-400 text-sm leading-6">
              You are watching this game in real time. The board updates
              automatically whenever either player makes a move.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}