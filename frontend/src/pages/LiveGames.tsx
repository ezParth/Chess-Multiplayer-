import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { useNavigate } from "react-router-dom";

interface ISpectateObject {
  roomId: string;
  white: string;
  black: string;
  fen: string;
}

const LiveGames = () => {
  const [games, setGames] = useState<ISpectateObject[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("get-all-games");
    });

    socket.on("get-games", (games: ISpectateObject[]) => {
      setGames(games);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-10">Live Chess Games</h1>

      {games.length === 0 ? (
        <div className="text-center text-slate-400 text-xl">
          No live games currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {games.map((game) => (
            <div
              key={game.roomId}
              className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 flex gap-6"
            >
              {/* Small Chessboard */}
              <div>
                <Chessboard
                  options={{
                    position: game.fen,
                    allowDragging: false,
                    // boardWidth: 700,
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

              {/* Game Details */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    {game.white} vs {game.black}
                  </h2>

                  <p className="text-slate-400 text-sm">Room ID</p>

                  <p className="font-mono text-sm break-all mb-6">
                    {game.roomId}
                  </p>

                  <div className="space-y-3">
                    <div className="bg-slate-800 rounded-lg px-4 py-2">
                      ♔ White:{" "}
                      <span className="font-semibold">{game.white}</span>
                    </div>

                    <div className="bg-slate-800 rounded-lg px-4 py-2">
                      ♚ Black:{" "}
                      <span className="font-semibold">{game.black}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/spectate/${game.roomId}`)}
                  className="mt-6 bg-green-600 hover:bg-green-700 rounded-lg py-3 font-semibold transition"
                >
                  Spectate Game
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveGames;
