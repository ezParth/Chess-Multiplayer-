import type { Response } from "express";

export const returnInternalServerError = (
  res: Response,
  error: unknown
) => {
  console.error(error);

  return res.status(500).json({
    message: "Internal Server Error",
    success: false,
    error,
  });
};