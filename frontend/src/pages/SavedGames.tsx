import { useEffect, useState } from "react";
import ChessBoard from "./ChessBoard";
import { getSavedGames } from "../api/chess.api";

interface SavedGame {
  roomId: string;
  white: string;
  black: string;
  finalFen: string;
  createdAt: string;
}

export default function SavedGames() {
  const [fen, setFen] = useState("");
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("FEN SV - ", fen)

  const handleSetFen = (fo: any) => {
    setFen(fo)
    console.log("HANLE FEN - ", fen)
  }

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getSavedGames();

        setSavedGames(response.games);

        if (response.games.length > 0) {
          setFen(response.games[0].finalFen);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="flex gap-8 p-8">
      <div className="w-[600px]">
        <ChessBoard fen={fen} />
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6">
          Saved Games
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : savedGames.length === 0 ? (
          <p>No Saved Games</p>
        ) : (
          <div className="space-y-4">
            {savedGames.map((game) => (
              <div
                key={game.roomId}
                onClick={() => {
                  console.log("clicked");
                  handleSetFen(game.finalFen);
                }}
                className="border rounded-lg p-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <p>
                  <strong>White:</strong> {game.white}
                </p>

                <p>
                  <strong>Black:</strong> {game.black}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(game.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}