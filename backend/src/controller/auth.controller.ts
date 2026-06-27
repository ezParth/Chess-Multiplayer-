import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.ts";
const JWT_SECRET = "helloworld"

const generateToken = (
  userId: string
): string => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const signup = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, password } = req.body;
    console.log("Body:", req.body);
console.log("Username:", req.body.username);
console.log("Password:", req.body.password);

    if (!username || !password) {
      res.status(400).json({
        message: "All fields required",
      });
      return;
    }

    const existingUser =
      await User.findOne({ username });

    if (existingUser) {
      console.log("ISSUE IN EXISTING USER")
      return res.status(400).json({
        message: "Username already exists",
        success: false
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = generateToken(
      user._id.toString()
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
      },
      token: token
    });
  } catch (error) {
    console.log("Error in signup: ",error)
    res.status(500).json(error);
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, password } = req.body;


    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
      // return;
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      res.status(400).json({
        message: "Invalid credentials",
      });
      return;
    }

    const token = generateToken(
      user._id.toString()
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
      },
      token: token
    });
  } catch (error) {
    console.log("Error in login ",error)
    res.status(500).json(error);
  }
};

export const logout = (
  req: Request,
  res: Response
): void => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout successful",
  });
};