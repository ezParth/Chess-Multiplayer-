// ChessGame.tsx

// add a timer here...
import { Chessboard } from "react-chessboard";
import { useMultiplayerChess } from "../hooks/useMultiPlayerChess";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function GameLayout() {
  const {
    game,
    playerColor,
    capturedWhite,
    capturedBlack,
    onDrop,
    connectSocket,
    resetGame,
    flipBoard,
    isWaiting,
    gameEnd,
    SaveGameForLater,
    goHome,
    opponentUsername,
    sendMessage,
    messages,
  } = useMultiplayerChess();

  const { friendName } = useParams();
  const [chatMessage, setChatMessage] = useState("");

  const pieceIconsBlack: Record<string, string> = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
  };

  const pieceIconsWhite: Record<string, string> = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
  };

  const [whiteTime, setWhiteTime] = useState(10 * 60);
  const [blackTime, setBlackTime] = useState(10 * 60);

  useEffect(() => {
    if (isWaiting) return;

    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((t) => Math.max(0, t - 1));
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game, isWaiting]);

  useEffect(() => {
    if (friendName) {
      connectSocket(friendName);
    }
  }, [friendName, connectSocket]);

  const formatTime = (seconds: number) => {
    if (!opponentUsername) {
      return `10:00`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {isWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40">
          <div className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />

            <p className="mt-6 text-xl font-semibold">
              Waiting for opponent...
            </p>

            <p className="text-gray-400 mt-2">
              Another player will join shortly.
            </p>
          </div>
        </div>
      )}
      {/* <h1 className="text-3xl font-bold text-center mb-6">Chess Game</h1> */}

      <div className="flex justify-center gap-8">
        {/* Left Side - Game Info & Chat */}
        <div className="w-64">
          <div className="bg-slate-900 rounded-xl p-4">
            <h2 className="text-xl font-bold mb-2">Game Info</h2>
            <p>
              Turn:{" "}
              <span className="font-bold">
                {game.turn() === "w" ? "White" : "Black"}
              </span>
            </p>
            {game.isCheck() && <p className="text-yellow-400 mt-2">Check!</p>}
            {game.isCheckmate() && (
              <p className="text-red-500 mt-2">Checkmate!</p>
            )}
          </div>

          {/* Chat */}
          {opponentUsername && (<div className="border-t border-slate-700 pt-4 mt-10 flex flex-col flex-1">
            <h3 className="font-bold mb-3">Game Chat</h3>

            <div className="bg-slate-950 rounded-lg p-3 h-64 overflow-y-auto flex flex-col gap-2">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-sm text-center mt-10">
                  No messages yet.
                </p>
              ) : (
                messages.map((msg, index) => {
                  const isMe =
                    msg.username === localStorage.getItem("username");

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 ${
                          isMe
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        <p className="text-xs text-slate-300 mb-1 font-semibold">
                          {isMe ? "You" : msg.username}
                        </p>

                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatMessage.trim()) {
                    sendMessage(chatMessage);
                    setChatMessage("");
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-lg bg-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => {
                  if (!chatMessage.trim()) return;

                  sendMessage(chatMessage);
                  setChatMessage("");
                }}
                className="bg-green-600 hover:bg-green-700 px-4 rounded-lg font-semibold"
              >
                Send
              </button>
            </div>
          </div>)}
        </div>

        {/* Center Board */}
        <div className="w-[580px] flex justify-center">
          <div className="flex flex-col gap-3">
            {/* Opponent */}
            <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center justify-between shadow">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg">
          {(friendName ?? "Opponent").charAt(0).toUpperCase()}
        </div> */}

                <div>
                  <p className="font-semibold">
                    {friendName ?? opponentUsername ?? "Opponent"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {playerColor === "white" ? "Black" : "White"}
                  </p>
                </div>
              </div>

              <div className="text-2xl font-mono font-bold">
                {playerColor === "white"
                  ? formatTime(blackTime)
                  : formatTime(whiteTime)}
              </div>
            </div>

            {/* Chess Board */}
            <div className="w-[580px] flex justify-center">

            <Chessboard
              options={{
                position: game.fen(),
                onPieceDrop: onDrop,
                boardOrientation: playerColor,
                boardStyle: {
                  borderRadius: "12px",
                  boxShadow: "0 0 25px rgba(0,0,0,0.5)",
                },
                lightSquareStyle: { backgroundColor: "#f0d9b5" },
                darkSquareStyle: { backgroundColor: "#b58863" },
              }}
              />
              </div>

            {/* You */}
            <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center justify-between shadow">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
          {localStorage
            .getItem("username")
            ?.charAt(0)
            .toUpperCase()}
        </div> */}

                <div>
                  <p className="font-semibold">
                    {localStorage.getItem("username")}
                  </p>

                  <p className="text-xs text-slate-400">
                    {playerColor === "white" ? "White" : "Black"}
                  </p>
                </div>
              </div>

              <div className="text-2xl font-mono font-bold">
                {playerColor === "white"
                  ? formatTime(whiteTime)
                  : formatTime(blackTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="w-80">
          <div className="bg-slate-900 rounded-xl p-4 flex flex-col h-[760px]">
            <h2 className="text-xl font-bold mb-4">Controls</h2>

            {!friendName && !opponentUsername && (
              <button
                onClick={() => connectSocket("")}
                className="w-full bg-yellow-600 py-2 rounded hover:bg-yellow-700 mb-4"
              >
                {game.isCheckmate() ? "Start A New Game" : "Start / Join Game"}
              </button>
            )}

            {!opponentUsername && (
              <>
                <button
                  onClick={resetGame}
                  className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
                >
                  Reset Game
                </button>

                <button
                  onClick={goHome}
                  className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
                >
                  Home
                </button>
              </>
            )}

            <button
              onClick={flipBoard}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Flip Board
            </button>

            {opponentUsername && (
              <button
                onClick={SaveGameForLater}
                className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
              >
                Save Game For Later
              </button>
            )}

            {!isWaiting && (
              <button
                onClick={gameEnd}
                className="w-full bg-red-600 py-2 rounded hover:bg-red-700 mb-4"
              >
                Resign / Leave Game
              </button>
            )}

            {/* Captured Pieces */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">White Lost</h3>

              <div className="flex flex-wrap gap-2 text-3xl bg-black rounded p-2 min-h-[52px]">
                {capturedWhite.map((piece, i) => (
                  <span key={i}>{pieceIconsBlack[piece] ?? piece}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">Black Lost</h3>

              <div className="flex flex-wrap gap-2 text-3xl bg-amber-50 text-black rounded p-2 min-h-[52px]">
                {capturedBlack.map((piece, i) => (
                  <span key={i}>{pieceIconsWhite[piece] ?? piece}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
