import { ChessMatch } from "../models/chessMatch.model.ts";
import { User } from "../models/user.model.ts";
import { returnInternalServerError } from "../utils/Returns.ts";
import type { Request, Response } from "express";

export type result = "white" | "black" | "draw" | "pending" | "started";
export type reason = "abandoned" | "resign" | "checkmate";

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await User.find({})

    const newPlayers = players.map((player) => ({
      username: player.username,
      userId: player._id
  }))
    return res.status(200).json({
      message: "FETCHED PLAYERS SUCCESSFULLY",
      success: true,
      players: newPlayers
    })
  } catch (error) {
    console.log("ERROR IN GET ALL PLAYERS- ", error)
    return returnInternalServerError(res, error)
  }
}

export const startGame = async (
  white: string,
  black: string,
  roomId: string
) => {
  try {
    const whiteUser = await User.findOne({ username: white });
    const blackUser = await User.findOne({ username: black });
    if (!whiteUser || !blackUser) {
      console.log(
        `user is missing: White: ${whiteUser?._id} Black: ${blackUser?._id}`
      );
      return false;
    }

    const existingGame = await ChessMatch.findOne({ roomId });

    if (existingGame) {
      return false;
    }

    const chessMatch = await ChessMatch.create({
      white: whiteUser?._id,
      black: blackUser?._id,
      result: "started",
      roomId: roomId,
    });

    console.log("Game Started \n", chessMatch)

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// white player will start the game and call this api
export const startGameApi = async (req: Request, res: Response) => {
  try {
    console.log("SAVE GAME API")
    const { white, black, roomId } = req.body;
    const bool = await startGame(white, black, roomId);
    if (!bool) {
      return returnInternalServerError(res, "Internal Server Error");
    }

    return res.status(200).json({
      message: "Successfully started the game",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return returnInternalServerError(res, error);
  }
};

export const saveFinishedGame = async (
  result: result,
  reason: reason,
  finalFen: string,
  roomId: string
) => {
  try {
    const findGame = await ChessMatch.findOne({ roomId: roomId });

    if (findGame) {
      findGame.result = result;
      findGame.reason = reason;
      findGame.finalFen = finalFen;
      await findGame.save();
      console.log("SAVED FINISHED GAME", findGame)
      return true;
    } else {
      console.log("cannot find the game");
      return false;
    }

  } catch (error) {
    console.log(error);
    return false;
  }
};

export const saveGame = async (req: Request, res: Response) => {
  try {
    console.log("SAVE GAME FUNCTION")
    const roomId = req.body.roomId;
    const fen = req.body.fen;
    const userId = req.userId;
    if (!roomId || !userId) {
      return res.status(404).json({
        success: false,
        message: `something is missing roomId: ${roomId} userId: ${userId}`,
      });
    }

    const findGame = await ChessMatch.findOne({ roomId: roomId });
    if (!findGame) {
      return res.status(404).json({
        success: false,
        message: "Game not found!",
      });
    }

    findGame.result = "pending";
    findGame.finalFen = fen;
    await findGame.save();

    console.log("SAVED GAME SUCCESSFULLY \n", findGame)

    return res.status(200).json({
      message: "Game Saved Successfully",
      success: true,
    });
  } catch (error) {
    return returnInternalServerError(res, error);
  }
};

export const getAllSavedGames = async (
  req: Request,
  res: Response
) => {
  try {
    const savedGames = await ChessMatch.find({
      result: "pending",
    })
      .select("roomId finalFen white black createdAt")
      .populate({
        path: "white",
        select: "username",
      })
      .populate({
        path: "black",
        select: "username",
      });
      
      
      const games = savedGames.map((game) => ({
        roomId: game.roomId,
        finalFen: game.finalFen,
        white: (game.white as any).username,
        black: (game.black as any).username,
        createdAt: game.createdAt,
      }));
      
      console.log("GAMES - ", savedGames)
    return res.status(200).json({
      success: true,
      message: "Fetched all saved games successfully",
      games,
    });
  } catch (error) {
    return returnInternalServerError(res, error);
  }
};

// export const getAllSavedGames = async (req: any, res: any) => {
//   try {
//     const savedGames = await ChessMatch.find({
//       result: "pending",
//     })
//       .select("roomId finalFen white black")
//       .populate({
//         path: "white",
//         select: "username",
//       })
//       .populate({
//         path: "black",
//         select: "username",
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Fetched all saved Games successfully",
//       games: savedGames,
//     });
//   } catch (error) {
//     return returnInternalServerError(res, error);
//   }
// };
