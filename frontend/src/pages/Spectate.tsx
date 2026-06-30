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

  useEffect(() => {
    if (!roomId) return;

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to spectate");
    });

    socket.on(roomId, (newFen: string) => {
      try {
        game.load(newFen);
        setFen(newFen);
      } catch (err) {
        console.error("Invalid FEN:", err);
      }
    });

    return () => {
      socket.off(roomId);
      socket.disconnect();
    };
  }, [roomId, game]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-2">
        Spectating Game
      </h1>

      <p className="text-slate-400 mb-8">
        Room: {roomId}
      </p>

      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl w-[640px]">
        <Chessboard
          options={{
            position: fen,
            allowDragging: false,
            boardStyle: {
              borderRadius: "12px",
              boxShadow: "0 0 25px rgba(0,0,0,0.5)",
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

      <Link
        to="/live-games"
        className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
      >
        Back to Live Games
      </Link>
    </div>
  );
}