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
  
  const JWT_SECRET = "helloworld"

  export const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const token =
      req.cookies?.token;

      // console.log("Cookies:", req.cookies, "\nCookies End");
  
    if (!token) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
  
    try {
      const decoded = jwt.verify(
        token,
        JWT_SECRET
        // process.env.JWT_SECRET as string
      ) as {
        userId: string;
      };

      // console.log("DECODED: ",decoded);
  
      req.userId = decoded.userId;
  
      next();
    } catch(error) {
      console.log("ERROR: ", error)
      res.status(401).json({
        message: "Invalid token",
      });
    }
  };
