import { useEffect, useState } from "react";
import ChessBoard from "./ChessBoard";
import { getSavedGames } from "../api/chess.api";
import ChessBoardImage from "../assets/ChessBoard.png";

interface SavedGame {
  roomId: string;
  white: string;
  black: string;
  finalFen: string;
  createdAt: string;
}

export default function SavedGames() {
  const [fen, setFen] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getSavedGames();

        setSavedGames(response.games);

        if (response.games.length > 0) {
          setFen(response.games[0].finalFen);
          setSelectedRoom(response.games[0].roomId);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleSelectGame = (game: SavedGame) => {
    setFen(game.finalFen);
    setSelectedRoom(game.roomId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <h1 className="text-4xl font-bold mb-10">
          Saved Games
        </h1>

        <div className="grid grid-cols-[680px_1fr] gap-10">

          {/* Chess Board */}
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-6">
            <ChessBoard fen={fen} />
          </div>

          {/* Saved Games */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Saved Games
            </h2>

            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-slate-400 animate-pulse">
                  Loading Games...
                </p>
              </div>
            ) : savedGames.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-slate-500 text-lg">
                  No Saved Games
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">

                {savedGames.map((game) => (
                  <div
                    key={game.roomId}
                    onClick={() => handleSelectGame(game)}
                    className={`
                        flex
                        items-center
                        gap-5
                        p-4
                        rounded-xl
                        cursor-pointer
                        transition-all
                        duration-200
                        border

                        ${
                          selectedRoom === game.roomId
                            ? "bg-slate-700 border-blue-500"
                            : "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500"
                        }
                    `}
                  >
                    <img
                      src={ChessBoardImage}
                      alt="Chess"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-600"
                    />

                    <div className="flex-1">

                      <h3 className="text-lg font-semibold">
                        {game.white}
                        <span className="mx-2 text-slate-400">
                          vs
                        </span>
                        {game.black}
                      </h3>

                      <p className="text-sm text-slate-400 mt-1">
                        {new Date(game.createdAt).toLocaleString()}
                      </p>

                    </div>

                    <div className="text-blue-400 font-semibold">
                      View →
                    </div>

                  </div>
                ))}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}