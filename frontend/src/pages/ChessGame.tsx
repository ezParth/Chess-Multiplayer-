// ChessGame.tsx

// add a timer here...
import { Chessboard } from "react-chessboard";
import { useMultiplayerChess } from "../hooks/useMultiPlayerChess";

export default function ChessGame() {
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
    goHome
  } = useMultiplayerChess();

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
      <h1 className="text-3xl font-bold text-center mb-6">Chess Game</h1>

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
        <div className="w-[640px] flex justify-center">
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

        {/* Right Side - Controls */}
        <div className="w-72">
          <div className="bg-slate-900 rounded-xl p-4">
            <h2 className="text-xl font-bold mb-4">Controls</h2>

            <button
              onClick={connectSocket}
              className="w-full bg-yellow-600 py-2 rounded hover:bg-yellow-700 mb-4"
            >
              {game.isCheckmate() ? "Start A New Game" : "Start / Join Game"}
            </button>

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

            <button
              onClick={flipBoard}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Flip Board
            </button>

            <button
              onClick={SaveGameForLater}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Save Game For Later
            </button>

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
