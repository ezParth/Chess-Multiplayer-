/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import {Socket, io} from "socket.io-client"

interface Move {
  roomId: string
  move: string
}

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
}


export default function ChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [playerPlayingColor, setPlayerPlayingColor] =
  useState<"white" | "black">("white");
  const [roomId, setRoomId] = useState<string | null>(null)

  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);

  const [moveSquares, setMoveSquares] = useState<
    Record<string, React.CSSProperties>
  >({});



  const onDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!targetSquare) return false;

    const gameCopy = new Chess(game.fen());

    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false;

    if (move.captured) {
      if (move.color === "w") {
        setCapturedBlack((prev) => [...prev, move.captured!]);
      } else {
        setCapturedWhite((prev) => [...prev, move.captured!]);
      }
    }

    setMoveSquares({});
    setGame(gameCopy);


    if(socketRef.current) {
      if(!roomId) {
        setRoomId(localStorage.getItem("roomId"))
        if(!roomId) {
          throw new Error("Cannot find roomId")
          
        }
      }
      socketRef.current.emit("move", ({roomId, gameCopy}))
    }

    return true;
  };

  const onPieceClick = ({ square }: { square: string }) => {
    const moves = game.moves({
      square: square as any,
      verbose: true,
    });

    const highlightedSquares: Record<string, React.CSSProperties> = {};

    moves.forEach((move) => {
      highlightedSquares[move.to] = {
        background:
          "radial-gradient(circle, rgba(0,0,0,0.3) 25%, transparent 26%)",
        borderRadius: "50%",
      };
    });

    setMoveSquares(highlightedSquares);
  };

  const resetGame = () => {
    setGame(new Chess());

    setCapturedWhite([]);
    setCapturedBlack([]);

    setMoveSquares({});
  };

  const flipBoard = () => {
    if(playerPlayingColor == "white") {
        setPlayerPlayingColor("black")
    } else {
        setPlayerPlayingColor("white")
    }
  }

    // socket code

  const socketRef = useRef<Socket | null>(null)

  const handleStart = () => {
    socketRef.current = io("http://localhost:5173")
  }

  const [waiting, setWaiting] = useState<boolean | null>(null)

  useEffect(() => {
    const socket = socketRef.current

    const handleWaiting = () => {
      setWaiting(true);
    };

    if (socket != null) socket.on("waiting", handleWaiting)
    if (socket != null) socket.on("game-start", (roomId, opponent, me) => {
      localStorage.setItem("roomId", roomId)
      setRoomId(roomId)
      console.log(opponent, me, roomId)
    })
    if(socket != null) socket.on("opponent-move", (move) => {
      setGame(move)
    })

    return () => {
      // if (socket != null) socket.off("waiting", handleWaiting);
      if (socket != null) socket.disconnect();
      // if (socket != null) socket.disconnect("disconnect")
    };
  })


  // socket code end

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
              onPieceDrop: onDrop,
              onPieceClick,
              squareStyles: moveSquares,
              boardOrientation: playerPlayingColor,

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

        {/* Right Side */}
        <div className="w-72">
          <div className="bg-slate-900 rounded-xl p-4">
            <h2 className="text-xl font-bold mb-4">Controls</h2>

            <div className="mb-4">
              <h3 className="font-bold mb-2">White Lost</h3>

              <div className="flex flex-wrap gap-2 text-3xl bg-black">
                {capturedWhite.map((piece, index) => (
                  <span key={index}>{pieceIconsWhite[piece]}</span>
                ))}
              </div>
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 hover:cursor-pointer mb-4"
            >
              Reset Game
            </button>
            <button
              onClick={flipBoard}
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 hover:cursor-pointer mb-4"
            >
              ⏎
            </button>
            <button
              onClick={handleStart}
              className="w-full bg-yellow-600 py-2 rounded hover:bg-yellow-700 hover:cursor-pointer mb-4"
            >
              Start
            </button>

            <h2 className="text-xl font-bold mb-3">Move History</h2>

            <div className="max-h-[500px] overflow-y-auto">
              {game.history().length === 0 ? (
                <p className="text-slate-400">No moves yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {game.history().map((move, index) => (
                    <div
                      key={index}
                      className="bg-slate-800 p-2 rounded text-sm"
                    >
                      {index + 1}. {move}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">Black Lost</h3>

              <div className="flex flex-wrap gap-2 text-3xl bg-amber-50">
                {capturedBlack.map((piece, index) => (
                  <span key={index}>{pieceIconsBlack[piece]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
