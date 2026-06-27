import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import app from "./app.ts";
import { setupSocket } from "./src/websocket/socket.ts";

dotenv.config();

const server = http.createServer(app);
setupSocket(server);
const port =  process.env.PORT || 3000

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/chesss"
  )
  .then(() => {
    console.log(
      "MongoDB Connected"
    );

    server.listen(
     port,
      () => {
        console.log(
          `Server bounded on port ${port}`
        );
      }
    );
  })
  .catch(console.error);