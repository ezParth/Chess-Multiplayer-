/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";

interface ChessBoardProps {
  fen: string;
}

export default function ChessBoard({
  fen,
}: ChessBoardProps) {
  const [game, setGame] = useState(() => new Chess());

  useEffect(() => {
    if (!fen) return;

    const chess = new Chess();

    chess.load(fen);

    setGame(chess);
  }, [fen]);

  return (
    <div className="w-full text-white">

      <div className="flex justify-center gap-8">

        {/* Left Panel */}
        <div className="w-[260px] bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">

          <h2 className="text-2xl font-bold mb-6">
            Game Info
          </h2>

          <div className="space-y-6">

            <div>
              <p className="text-sm text-slate-400">
                Current Turn
              </p>

              <p className="text-xl font-bold mt-1">
                {game.turn() === "w"
                  ? "⚪ White"
                  : "⚫ Black"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Status
              </p>

              {game.isCheckmate() ? (
                <p className="text-red-400 font-semibold mt-1">
                  ♚ Checkmate
                </p>
              ) : game.isCheck() ? (
                <p className="text-yellow-400 font-semibold mt-1">
                  ⚠ Check
                </p>
              ) : (
                <p className="text-green-400 font-semibold mt-1">
                  ✓ Game Running
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Total Moves
              </p>

              <p className="font-semibold mt-1">
                {game.history().length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Full Move Number
              </p>

              <p className="font-semibold mt-1">
                {Math.floor(game.history().length / 2) + 1}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Legal Moves
              </p>

              <p className="font-semibold mt-1 text-green-400">
                {game.moves().length}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Game Over
              </p>

              <p
                className={`mt-1 font-semibold ${
                  game.isGameOver()
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {game.isGameOver()
                  ? "Yes"
                  : "No"}
              </p>
            </div>

          </div>

        </div>

        {/* Chess Board */}

        <div className="w-[640px] bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">

          <h2 className="text-center text-2xl font-bold mb-6">
            Chess Position
          </h2>

          <Chessboard
            boardWidth={592}
            options={{
              id: "saved-board",
              position: game.fen(),

              boardStyle: {
                borderRadius: "16px",
                boxShadow:
                  "0 0 30px rgba(0,0,0,.55)",
              },

              lightSquareStyle: {
                backgroundColor: "#f0d9b5",
              },

              darkSquareStyle: {
                backgroundColor: "#b58863",
              },
            }}
          />

          <div className="mt-6">

            <h3 className="font-semibold mb-2">
              FEN
            </h3>

            <div className="bg-slate-800 rounded-lg p-3 text-xs break-all text-slate-300">
              {game.fen()}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}