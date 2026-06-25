// hooks/useMultiplayerChess.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Socket, io } from "socket.io-client";
import type { PieceDropHandlerArgs } from "react-chessboard";

interface UseChessReturn {
  game: Chess;
  playerColor: "white" | "black";
  roomId: string | null;
  capturedWhite: string[];
  capturedBlack: string[];
  isConnected: boolean;
  onDrop: (args: PieceDropHandlerArgs) => boolean;
  connectSocket: () => void;
  resetGame: () => void;
  flipBoard: () => void;
}

export const useMultiplayerChess = (): UseChessReturn => {
  const [game, setGame] = useState(() => new Chess());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const gameRef = useRef(game);

  // Keep gameRef updated
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const updateCapturedPieces = useCallback((newGame: Chess, lastMoveColor?: string) => {
    // TODO: Improve this logic later by comparing FENs
    // For now, we'll handle it mainly on local moves
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current) return;

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));

    socket.on("waiting", () => console.log("Waiting for opponent..."));

    socket.on("game-start", ({ roomId: rId, white, black }) => {
      setRoomId(rId);
      localStorage.setItem("roomId", rId);
      setPlayerColor(socket.id === white ? "white" : "black");
    });

    socket.on("opponent-move", (fen: string) => {
      const newGame = new Chess(fen);
      setGame(newGame);
      updateCapturedPieces(newGame);
    });

    socket.on("opponent-disconnected", () => {
      alert("Opponent disconnected");
    });
  }, [updateCapturedPieces]);

  const onDrop = useCallback(({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    if (!roomId || !socketRef.current) return false;
    if (!targetSquare) return false

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!move) return false;
    if (move.color !== playerColor[0]) return false;

    // Update local state
    setGame(gameCopy);

    // Update captured pieces
    if (move.captured) {
      if (move.color === "w") {
        setCapturedBlack((prev) => [...prev, move.captured!]);
      } else {
        setCapturedWhite((prev) => [...prev, move.captured!]);
      }
    }

    // Send to server
    socketRef.current.emit("move", { roomId, fen: gameCopy.fen() });

    return true;
  }, [roomId, playerColor, game]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setCapturedWhite([]);
    setCapturedBlack([]);
  }, []);

  const flipBoard = useCallback(() => {
    setPlayerColor((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    game,
    playerColor,
    roomId,
    capturedWhite,
    capturedBlack,
    isConnected,
    onDrop,
    connectSocket,
    resetGame,
    flipBoard,
  };
};