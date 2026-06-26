// hooks/useMultiplayerChess.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Socket, io } from "socket.io-client";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { useNavigate } from "react-router-dom";

interface UseChessReturn {
  game: Chess;
  playerColor: "white" | "black";
  roomId: string | null;
  capturedWhite: string[];
  capturedBlack: string[];
  isConnected: boolean;
  isWaiting: boolean | null;
  opponentUsername: string;
  myUsername: string;
  onDrop: (args: PieceDropHandlerArgs) => boolean;
  connectSocket: () => void;
  resetGame: () => void;
  flipBoard: () => void;
  gameEnd: () => void;
  // checkMate: boolean
  winner: string
  // setCheckMate: (arg: boolean) => void;
  setWinner: (arg: string) => void;
  reason: string
}

export const useMultiplayerChess = (): UseChessReturn => {
  const [game, setGame] = useState(() => new Chess());
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState<boolean | null>(null);
  const [opponentUsername, setOpponentUsername] = useState<string>("");
  const [myUsername, setMyUsername] = useState<string>("");
  // const [checkMate, setCheckMate] = useState<boolean>(false)
  const [winner, setWinner] = useState("")
  const [reason, setReason] = useState("")

  const socketRef = useRef<Socket | null>(null);
  const gameRef = useRef(game);

  const nav = useNavigate();

  // Keep gameRef updated
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Improved captured pieces logic (basic version)
  const updateCapturedPieces = useCallback((newGame: Chess) => {
    // For better accuracy, compare previous and current FEN in future
    // This is a simple placeholder
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      const username = localStorage.getItem("username");
      if (!username) {
        alert("Please login first");
        resetGame();
        nav("/login");
        return;
      }
      setMyUsername(username);
      socket.emit("set-username", username);
    });

    socket.on("waiting", () => {
      setIsWaiting(true);
    });

    socket.on("game-start", ({ roomId: rId, white, black }) => {
      setRoomId(rId);
      localStorage.setItem("roomId", rId);
      setIsWaiting(false);

      const isWhitePlayer = socket.id === white.id;
      setPlayerColor(isWhitePlayer ? "white" : "black");
      setOpponentUsername(isWhitePlayer ? black.username : white.username);

      nav(`/chess/${rId}`);
    });

    socket.on("opponent-move", (fen: string) => {
      const newGame = new Chess(fen);
      setGame(newGame);
      updateCapturedPieces(newGame);
    });

    socket.on("opponent-resigned", () => {
      alert("Opponent Resigned! You Win 🎉");
      resetGame();
    });

    socket.on("opponent-disconnected", () => {
      alert("Opponent disconnected");
      resetGame();
    });

    socket.on("game-over", ({ result, reason, finalFen, winner }) => {
      setGame(new Chess(finalFen)); // Final position
    
      if (result === "draw") {
        alert(`Game Over! It's a Draw (${reason})`);
      } else {
        const youWin = (playerColor === winner);
        alert(`Game Over! ${youWin ? "You Won 🎉" : "You Lost 😢"} by ${reason}`);
      }

      setWinner(result)
      setReason(reason)
    
      // Optional: reset after some time or let user click "New Game"
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [nav]);

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!roomId || !socketRef.current?.connected || !targetSquare) return false;

      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;
      if (move.color !== playerColor[0]) return false;

      setGame(gameCopy);

      if (move.captured) {
        if (move.color === "w") {
          setCapturedBlack((prev) => [...prev, move.captured!]);
        } else {
          setCapturedWhite((prev) => [...prev, move.captured!]);
        }
      }

      socketRef.current.emit("move", { roomId, fen: gameCopy.fen() });


      return true;
    },
    [roomId, playerColor, game]
  );

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setPlayerColor("white");
    setRoomId(null);
    setIsWaiting(null);
    setOpponentUsername("");
    setIsConnected(false);

    localStorage.removeItem("roomId");

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [nav]);

  const gameEnd = useCallback(() => {
    if (roomId && socketRef.current) {
      socketRef.current.emit("resign", roomId);
    }
    resetGame();
  }, [roomId, resetGame]);

  const flipBoard = useCallback(() => {
    setPlayerColor((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    game,
    playerColor,
    roomId,
    capturedWhite,
    capturedBlack,
    isConnected,
    isWaiting,
    opponentUsername,
    myUsername,
    onDrop,
    connectSocket,
    resetGame,
    flipBoard,
    gameEnd,
    // checkMate,
    winner,
    // setCheckMate,
    setWinner,
    reason
  };
};