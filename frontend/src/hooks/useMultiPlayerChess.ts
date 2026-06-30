/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useMultiplayerChess.ts
import { useState, useRef, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Socket, io } from "socket.io-client";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { useNavigate, useParams } from "react-router-dom";
import { saveGame } from "../api/chess.api";

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
  connectSocket: (friend?: string) => void;
  resetGame: () => void;
  flipBoard: () => void;
  gameEnd: () => void;
  // checkMate: boolean
  winner: string;
  // setCheckMate: (arg: boolean) => void;
  setWinner: (arg: string) => void;
  reason: string;
  SaveGameForLater: () => void;
  goHome: () => void;
  getOnlineUsers: () => void;
  onlineUsers: any;
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
  const [winner, setWinner] = useState("");
  const [reason, setReason] = useState("");
  const [onlineUsers, setOnlineUsers] = useState();
  const [playingAFriend, setPlayingAFriend] = useState(false);

  const { roomId: paramRoomId } = useParams(); // Better naming

  const roomIdRef = useRef<string | null>(null);

  useEffect(() => {
    roomIdRef.current = roomId || paramRoomId || null;
  }, [roomId, paramRoomId]);

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

  const connectSocket = useCallback((currentOpponentName?: string) => {
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
      if(currentOpponentName != "") {
        socket.emit("play-a-friend", currentOpponentName, username)
        setPlayingAFriend(true)
      } else {
        socket.emit("set-username", username);
      }
    });

    socket.on("online-users", (onlineUsersMap) => {
      setOnlineUsers(onlineUsersMap);
    });

    socket.on("waiting", () => {
      setIsWaiting(true);
    });

    socket.on("waiting-for-friend", () => {
      setIsWaiting(true);
      // setPlayingAFriend()
    });

    socket.on("game-start", ({ roomId: rId, white, black }) => {
      // console.log
      setRoomId(rId);
      localStorage.setItem("roomId", rId);
      setIsWaiting(false);

      const isWhitePlayer = socket.id === white.id;
      setPlayerColor(isWhitePlayer ? "white" : "black");
      setOpponentUsername(isWhitePlayer ? black.username : white.username);

      nav(`/chess/${rId}`);
    });

    socket.on("friend-game-start", ({ roomId: rId, white, black }) => {
      setRoomId(rId);
      localStorage.setItem("roomId", rId);
      setIsWaiting(false);

      const isWhitePlayer = socket.id === white.id;
      setPlayerColor(isWhitePlayer ? "white" : "black");
      setOpponentUsername(isWhitePlayer ? black.username : white.username);

      // if(playingAFriend) {
      //   // nav(`/chess/${rId}`)
      // } else {
      //   nav(`/chess/${rId}`);
      // }
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
      alert("chessOpponent disconnected");
      resetGame();
      nav("/");
    });

    socket.on("game-over", ({ result, reason, finalFen, winner }) => {
      setGame(new Chess(finalFen)); // Final position

      if (result === "draw") {
        alert(`Game Over! It's a Draw (${reason})`);
      } else {
        const youWin = playerColor === winner;
        alert(
          `Game Over! ${youWin ? "You Won 🎉" : "You Lost 😢"} by ${reason}`
        );
      }

      setWinner(result);
      setReason(reason);
      resetGame();
      nav("/chess");

      // Optional: reset after some time or let user click "New Game"
    });

    socket.on("save-game-for-later-accepted", async (fen) => {
      const currentRoomId = roomId || roomIdRef.current || paramRoomId;

      console.log("Current Room ID in save listener:", currentRoomId); // ← For debugging

      if (!currentRoomId) {
        console.error("Cannot save game: roomId is missing");
        alert("Cannot save game - Room ID not found. Please try again.");
        return;
      }

      try {
        console.log("Saving game with roomId:", currentRoomId);

        const response = await saveGame({
          roomId: currentRoomId,
          fen: fen ?? game.fen(),
        });

        if (response?.success) {
          socket.emit("game-saved-successfully");
          alert("Game Saved Successfully!");
          nav("/chess");
          resetGame();
        } else {
          alert("Failed to save game");
        }
      } catch (error) {
        console.error("Save game error:", error);
        alert("Error while saving the game");
      }
    });

    socket.on("game-saved", () => {
      alert("GAME SAVED SUCCESSFULLY");
      resetGame();
      nav("/chess");
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [nav]);

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!roomId || !socketRef.current?.connected || !targetSquare)
        return false;

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
    setPlayingAFriend(false)

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

  const SaveGameForLater = async () => {
    const currentRoomId = roomId || roomIds;

    if (!currentRoomId) {
      alert("Cannot save: Room ID not found");
      return;
    }

    if (!socketRef.current?.connected) {
      alert("Not connected to server");
      return;
    }

    console.log("Requesting to save game:", currentRoomId);
    // resetGame()
    socketRef.current.emit("save-game-for-later", currentRoomId);
  };

  const flipBoard = useCallback(() => {
    setPlayerColor((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  const goHome = () => {
    resetGame();
    nav("/");
  };

  const getOnlineUsers = () => {
    socketRef.current?.emit("get-online-users");
  };



  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        nav("/chess");
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
    reason,
    SaveGameForLater,
    goHome,
    getOnlineUsers,
    onlineUsers,
  };
};
