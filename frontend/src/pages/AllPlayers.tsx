import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAllPlayers } from "../api/chess.api";

interface IPlayers {
  username: string;
  userId: string;
}

const AllPlayers = () => {
  const [players, setAllPlayers] = useState<IPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username"))
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

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("register")
      socket.emit("get-online-users");
    });

    socket.on("online-users", (users: string[]) => {
      setOnlinePlayers(users);
      console.log("ONLINE PLAYERS - ", users)
      console.log("CALLED")
    });

    return () => {
      socket.off("connect");
      socket.off("online-users");
      socket.disconnect();
    };
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
            {players.map((player) => {
              const isOnline = onlinePlayers.includes(player.username) || player.username == username;

              return (
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

                      <p
                        className={`text-sm ${
                          isOnline
                            ? "text-green-400"
                            : "text-slate-500"
                        }`}
                      >
                        {isOnline ? "🟢 Online" : "⚫ Offline"}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={!isOnline}
                    className={`mt-6 w-full rounded-lg py-2.5 font-semibold transition ${
                      isOnline
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-700 cursor-not-allowed"
                    }`}
                  >
                    Challenge
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPlayers;