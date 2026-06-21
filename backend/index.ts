import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/chesss"
  )
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});