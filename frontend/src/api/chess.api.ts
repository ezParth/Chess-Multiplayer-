import axios from "axios";

const gameApi = axios.create({
  baseURL: "http://localhost:3000/api/game",
  withCredentials: true,
});

export interface StartGamePayload {
  white: string;
  black: string;
  roomId: string;
}

export interface SaveGamePayload {
  roomId: string;
  fen: string;
}

export interface FinishGamePayload {
  roomId: string;
  result: "white" | "black" | "draw";
  reason: "checkmate" | "abandoned" | "resign";
  finalFen: string;
}

export const startGame = async (
  data: StartGamePayload
) => {
  const response = await gameApi.post(
    "/start",
    data
  );

  return response.data;
};

export const saveGame = async (
  data: SaveGamePayload
) => {
  const response = await gameApi.post(
    "/save",
    data
  );

  return response.data;
};

export const finishGame = async (
  data: FinishGamePayload
) => {
  const response = await gameApi.post(
    "/finish",
    data
  );

  return response.data;
};

export const getSavedGames =
  async () => {
    const response =
      await gameApi.get("/saved");

    return response.data;
  };

export const getAllPlayers = async () => {
  const res = await gameApi.get("/allPlayers")

  return res.data
}