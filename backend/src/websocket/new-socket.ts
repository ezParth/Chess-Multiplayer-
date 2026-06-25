import { Server } from "socket.io";

let waitingPlayer: string | null = null;
const playerToRoom = new Map<string, string>()

export const setupSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    if (!waitingPlayer) {
      waitingPlayer = socket.id;

      socket.emit("waiting");
    } else {
      const roomId = `room-${waitingPlayer}-${socket.id}`;

      socket.join(roomId);

      io.sockets.sockets.get(waitingPlayer)?.join(roomId);
      playerToRoom.set(socket.id, roomId);
      playerToRoom.set(waitingPlayer, roomId);

      io.to(roomId).emit("game-start", {
        roomId,
        white: waitingPlayer,
        black: socket.id,
      });

      waitingPlayer = null;
    }

    socket.on("move", ({ roomId, move }) => {
      socket.to(roomId).emit("opponent-move", move);
    });

    socket.on("disconnect", () => {
      const roomId = playerToRoom.get(socket.id)

      if(roomId) {
        socket.to(roomId).emit("opponent-disconnected"); // except current socket
      }

      playerToRoom.delete(socket.id);

      if (waitingPlayer === socket.id) {
        waitingPlayer = null;
      }

      console.log("Disconnected:", socket.id);
    });
  });
};