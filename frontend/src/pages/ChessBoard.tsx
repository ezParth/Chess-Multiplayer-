/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";

// const pieceIconsBlack: Record<string, string> = {
//   p: "♟",
//   r: "♜",
//   n: "♞",
//   b: "♝",
//   q: "♛",
//   k: "♚",
// };

// const pieceIconsWhite: Record<string, string> = {
//     p: "♙",
//     r: "♖",
//     n: "♘",
//     b: "♗",
//     q: "♕",
//     k: "♔",
// }


export default function ChessBoard({fen}: {fen: any}) {
    const [game, setGame] = useState(() => new Chess())
    console.log("FEN - ", fen)
    
    useEffect(() => {
        if(fen != "") {
            game.load(fen)
        }
    }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Chess Game</h1>

      <div className="flex justify-center gap-8">
        {/* Left Side */}
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
              id: "BasicBoard",
              position: game.fen(),

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
      </div>
    </div>
  );
}
