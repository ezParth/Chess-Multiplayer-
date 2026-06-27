import { useEffect, useState } from "react";
import { getAllPlayers } from "../api/chess.api";

interface IPlayers {
  username: string;
  userId: string;
}

const AllPlayers = () => {
  const [players, setAllPlayers] = useState<IPlayers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllPlayersFunc = async () => {
      try {
        const resp = await getAllPlayers();

        if (resp?.success) {
          setAllPlayers(resp.players);
        }
      } catch (err) {
        console.log("ERROR IN FETCHING PLAYERS - ", err);
      } finally {
        setLoading(false);
      }
    };

    getAllPlayersFunc();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto px-8 py-10">

        <h1 className="text-4xl font-bold mb-2">
          Players
        </h1>

        <p className="text-slate-400 mb-8">
          Challenge anyone and start a new chess match.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-400 animate-pulse text-lg">
              Loading players...
            </p>
          </div>
        ) : players.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500 text-lg">
              No players found.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {players.map((player) => (
              <div
                key={player.userId}
                className="
                  bg-slate-900
                  border
                  border-slate-800
                  rounded-2xl
                  p-5
                  shadow-xl
                  hover:border-blue-500
                  hover:-translate-y-1
                  transition-all
                  duration-200
                "
              >

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                    {player.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">

                    <h2 className="text-lg font-semibold">
                      {player.username}
                    </h2>

                    <p className="text-sm text-slate-400">
                      Ready to play
                    </p>

                  </div>

                </div>

                <button
                  className="
                    mt-6
                    w-full
                    bg-blue-600
                    hover:bg-blue-700
                    rounded-lg
                    py-2.5
                    font-semibold
                    transition
                  "
                >
                  Challenge
                </button>

              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
};

export default AllPlayers;