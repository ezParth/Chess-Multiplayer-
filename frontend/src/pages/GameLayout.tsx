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
  } = useMultiplayerChess();

  const { friendName } = useParams();

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
    if(!opponentUsername) {
        return `10:00`
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
        {/* Left Side - Game Info */}
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
            {friendName?? opponentUsername ?? "Opponent"}
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
        <div className="w-72">
          <div className="bg-slate-900 rounded-xl p-4">
            <h2 className="text-xl font-bold mb-4">Controls</h2>

            {!friendName && !opponentUsername && (
              <button
                onClick={() => connectSocket("")}
                className="w-full bg-yellow-600 py-2 rounded hover:bg-yellow-700 mb-4"
              >
                {game.isCheckmate() ? "Start A New Game" : "Start / Join Game"}
              </button>
            )}

            {!opponentUsername && (<button
              onClick={resetGame}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Reset Game
            </button>)}

            {!opponentUsername && (<button
              onClick={goHome}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Home
            </button>)}

            <button
              onClick={flipBoard}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Flip Board
            </button>

           {opponentUsername && ( <button
              onClick={SaveGameForLater}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Save Game For Later
            </button>)}

            {isWaiting == false && (
              <button
                onClick={gameEnd}
                className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
              >
                Resign/Leave Game
              </button>
            )}
            {/* Captured Pieces */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">White Lost</h3>
              <div className="flex flex-wrap gap-2 text-3xl bg-black p-2 rounded">
                {capturedWhite.map((piece, i) => (
                  <span key={i}>{pieceIconsBlack[piece] ?? piece}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">Black Lost</h3>
              <div className="flex flex-wrap gap-2 text-3xl bg-amber-50 p-2 rounded text-black">
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
