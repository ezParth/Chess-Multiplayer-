import axios from "axios";

export const startGame = (data: {
    white: string;
    black: string;
    roomId: string;
}) =>
    axios.post("/game/start", data);

export const saveGame = (data: {
    roomId: string;
    fen: string;
}) =>
    axios.post("/game/save", data);

export const getSavedGames = () =>
    axios.get("/game/saved");

export const finishGame = (data: {
    roomId: string;
    result: "white" | "black" | "draw";
    reason: "checkmate" | "abandoned" | "resign";
    finalFen: string;
}) =>
    axios.post("/game/finish", data);