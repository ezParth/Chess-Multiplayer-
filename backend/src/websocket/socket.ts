import { Server } from "socket.io";
import { Chess } from "chess.js";
import {
  saveFinishedGame,
  startGame,
  type result,
} from "../controller/chessMatch.controller.ts";

interface Player {
  id: string;
  username: string;
}

interface Room {
  game: Chess;
  players: {
    white: Player;
    black: Player;
  };
  saving: boolean;
}

const rooms = new Map<string, Room>();
let waitingPlayer: Player | null = null;
const onlineUsers = new Map<string, string>();

export const setupSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("register", (userId) => {
      socket.userId = userId;
      // for (const [id, socketId] of onlineUsers) {
      //   if (userId == id) {
      //     return;
      //   }
      // }

      // Here I am over writing the socket id
      onlineUsers.set(userId, socket.id);

      io.emit("online-users", [...onlineUsers.keys()]);
    });

    socket.on("get-online-users", () => {
      socket.emit("online-users", [...onlineUsers.keys()]);
    });

    // For Random Matches
    socket.on("set-username", async (username: string) => {
      const player: Player = {
        id: socket.id,
        username: username.trim() || `Player_${socket.id.slice(0, 6)}`,
      };

      if (!waitingPlayer) {
        waitingPlayer = player;
        socket.emit("waiting", { username: player.username });
      } else {
        const roomId = `room-${Date.now()}`;
        const game = new Chess();

        const room: Room = {
          game,
          players: {
            white: waitingPlayer,
            black: player,
          },
          saving: false,
        };

        rooms.set(roomId, room);

        socket.join(roomId);
        io.sockets.sockets.get(waitingPlayer.id)?.join(roomId);

        try {
          const gameStarted = await startGame(
            waitingPlayer.username,
            player.username,
            roomId
          );

          if (!gameStarted) {
            console.error("Failed to start game in database");
            socket.emit("game-error", "Failed to create game record");
            rooms.delete(roomId);
            return;
          }

          io.to(roomId).emit("game-start", {
            roomId,
            white: waitingPlayer,
            black: player,
          });
        } catch (error) {
          console.error("Error starting game:", error);
          socket.emit(
            "game-error",
            "Internal server error while starting game"
          );
          rooms.delete(roomId);
        }

        waitingPlayer = null;
      }
    });

    // Move handler with Game Over detection
    socket.on(
      "move",
      async ({ roomId, fen }: { roomId: string; fen: string }) => {
        const room = rooms.get(roomId);
        if (!room) return;

        const { game, players } = room;

        // Validate turn
        const isWhiteTurn = game.turn() === "w";
        const isPlayerWhite = socket.id === players.white.id;

        if (
          (isWhiteTurn && !isPlayerWhite) ||
          (!isWhiteTurn && isPlayerWhite)
        ) {
          return; // Not your turn
        }

        try {
          game.load(fen); // Update server game state

          // === Game Over Detection ===
          if (game.isGameOver()) {
            let result: result = "draw";
            let reason: any = "draw";

            if (game.isCheckmate()) {
              // The player whose turn it is now LOST
              const loser = game.turn(); // 'w' or 'b'
              result = loser === "w" ? "black" : "white";
              reason = "checkmate";
            } else if (game.isDraw()) {
              result = "draw";
              if (game.isStalemate()) reason = "stalemate";
              else if (game.isInsufficientMaterial()) reason = "insufficient";
              else reason = "draw";
            }

            const finalFen = game.fen();

            // Save game result to database
            await saveFinishedGame(result, reason, finalFen, roomId);

            // Notify both players
            io.to(roomId).emit("game-over", {
              result,
              reason,
              finalFen,
              winner: result === "draw" ? null : result,
            });

            console.log(`Game ${roomId} ended: ${reason} → ${result}`);
          } else {
            // Normal move - just forward to opponent
            socket.to(roomId).emit("opponent-move", fen);
          }
        } catch (e) {
          console.error("Invalid FEN received:", e);
        }
      }
    );

    // Resign handler
    socket.on("resign", async (roomId: string) => {
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      try {
        const isWhiteResigning = socket.id === room.players.white.id;
        const winner: result = isWhiteResigning ? "black" : "white"; // Opponent wins

        const finalFen = room.game.fen();

        // Save game result before notifying
        await saveFinishedGame(winner, "resign", finalFen, roomId);

        // Notify opponent
        socket.to(roomId).emit("opponent-resigned");
      } catch (error) {
        console.error("Error saving resigned game:", error);
      }
    });

    socket.on("save-game-for-later", (roomId) => {
      console.log("GAME SAVE WAS CALLED!");
      const fen = rooms.get(roomId)?.game.fen();
      const room = rooms.get(roomId);

      if (!room) return;

      room.saving = true;
      socket.to(roomId).emit("save-game-for-later-accepted", fen);
    });

    socket.on("game-saved-successfully", (roomId) => {
      socket.to(roomId).emit("game-saved");
    });

    // Disconnect handler
    socket.on("disconnect", async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("online-users", [...onlineUsers.keys()]);
      }
      for (const [roomId, room] of rooms.entries()) {
        if (
          room.players.white.id === socket.id ||
          room.players.black.id === socket.id
        ) {
          try {
            if (room.saving == true) {
              return;
            }
            const isWhiteLeaving = socket.id === room.players.white.id;
            const winner: result = isWhiteLeaving ? "black" : "white";

            const finalFen = room.game.fen();

            // Save result before deleting room
            const isGameOver = room.game.isGameOver();

            if (isGameOver) {
              console.log(
                `Game ${roomId} already finished. No need to save as abandoned.`
              );
            } else {
              await saveFinishedGame(winner, "abandoned", finalFen, roomId);
            }

            // Notify opponent
            socket.to(roomId).emit("opponent-disconnected");
          } catch (error) {
            console.error("Error saving abandoned game:", error);
          }

          // Delete room after saving
          rooms.delete(roomId);
        }
      }

      if (waitingPlayer?.id === socket.id) {
        waitingPlayer = null;
      }

      console.log("Disconnected:", socket.id);
    });
  });
};
