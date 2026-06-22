import type {
    Request,
    Response,
    NextFunction,
  } from "express";
  
  import jwt from "jsonwebtoken";
  
  export interface AuthRequest
    extends Request {
    userId?: string;
  }
  
  export const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const token =
      req.cookies?.token;
  
    if (!token) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
  
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as {
        userId: string;
      };
  
      req.userId = decoded.userId;
  
      next();
    } catch {
      res.status(401).json({
        message: "Invalid token",
      });
    }
  };