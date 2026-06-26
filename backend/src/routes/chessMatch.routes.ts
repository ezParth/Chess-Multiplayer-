import { Router } from "express";
import {
    startGameApi,
    saveGame,
    // finishGameApi,
    getAllSavedGames,
} from "../controller/chessMatch.controller.ts";

import { protect as verifyJwt } from "../middleware/auth.middleware.ts";

const router = Router();

router.post("/start", verifyJwt, startGameApi);

router.post("/save", verifyJwt, saveGame);

// router.post("/finish", verifyJwt, finishGameApi);

router.get("/saved", verifyJwt, getAllSavedGames);

export default router;