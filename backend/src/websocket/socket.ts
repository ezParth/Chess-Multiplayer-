import { Server } from "socket.io";
import { Chess } from "chess.js";

interface Room {
  game: Chess;
  players: { white: string; black: string };
}

const rooms = new Map<string, Room>();
let waitingPlayer: string | null = null;

export const setupSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    if (!waitingPlayer) {
      waitingPlayer = socket.id;
      socket.emit("waiting");
    } else {
      const roomId = `room-${Date.now()}`;
      const game = new Chess();

      rooms.set(roomId, {
        game,
        players: { white: waitingPlayer, black: socket.id },
      });

      socket.join(roomId);
      io.sockets.sockets.get(waitingPlayer)?.join(roomId);

      io.to(roomId).emit("game-start", {
        roomId,
        white: waitingPlayer,
        black: socket.id,
      });

      waitingPlayer = null;
    }

    // Move handler
    socket.on("move", ({ roomId, fen }: { roomId: string; fen: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const { game, players } = room;

      // Validate it's the opponent's move
      if (game.turn() === "w" && socket.id !== players.white) return;
      if (game.turn() === "b" && socket.id !== players.black) return;

      try {
        game.load(fen); // Update server game state
        socket.to(roomId).emit("opponent-move", fen);
      } catch (e) {
        console.error("Invalid move");
      }
    });

    socket.on("disconnect", () => {
      // Cleanup rooms where this player was
      for (const [roomId, room] of rooms) {
        if (room.players.white === socket.id || room.players.black === socket.id) {
          socket.to(roomId).emit("opponent-disconnected");
          rooms.delete(roomId);
        }
      }

      if (waitingPlayer === socket.id) waitingPlayer = null;
    });
  });
};