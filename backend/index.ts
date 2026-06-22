import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app.ts";

dotenv.config();

mongoose
  .connect(
    "mongodb://127.0.0.1:27017/chesss"
  )
  .then(() => {
    console.log(
      "MongoDB Connected"
    );

    app.listen(
      process.env.PORT || 3000,
      () => {
        console.log(
          "Server Running"
        );
      }
    );
  })
  .catch(console.error);