import { Router } from "express";
import { User } from "../models/users.js";
import { Gallery } from "../models/galleries.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import { authenticateToken } from "../middleware/auth.js";

export const userRouter = Router();

// sign up a new user and create a new gallery for the user
userRouter.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(422)
      .json({ error: "Username and password are required." });
  }

  let createdUser = null;

  User.findOne({ where: { username } })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists." });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      return User.create({ username, password: hashedPassword });
    })
    .then((user) => {
      const token = generateToken(user.id);
      user.token = token;
      createdUser = user;
      return user.save();
    })
    .then((user) => {
      return Gallery.create({
        UserId: user.id,
        name: `${user.username}'s Gallery`,
      });
    })
    .then((gallery) => {
      res.status(200).json({
        userId: createdUser.id,
        galleryId: gallery.id,
        token: createdUser.token,
      });
    })
    .catch((err) => {
      console.error("Sign up error:", err);
      res.status(500).json({ error: "Failed to sign up user." });
    });
});

// sign in an existing user
userRouter.post("/signin", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(422)
      .json({ error: "Username and password are required." });
  }

  User.findOne({ where: { username } })
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid username or password." });
      }
      const token = generateToken(user.id);
      user.token = token;
      return user.save();
    })
    .then((user) =>
      res.status(200).json({ userId: user.id, token: user.token })
    )
    .catch((err) => {
      console.error("Sign in error:", err);
      res.status(500).json({ error: "Failed to sign in user." });
    });
});

// sign out a user
userRouter.get("/signout", authenticateToken, (req, res) => {
  User.findByPk(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      user.token = null; // Invalidate the token
      return user.save();
    })
    .then(() => res.status(200).json({ message: "Successfully signed out." }))
    .catch((err) => {
      console.error("Sign out error:", err);
      res.status(500).json({ error: "Failed to sign out user." });
    });
});

// get user profile
userRouter.get("/me", authenticateToken, (req, res) => {
  User.findByPk(req.userId, { attributes: { exclude: ["password"] } })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error("Failed to fetch user profile:", err);
      res.status(500).json({ error: "Failed to fetch user profile." });
    });
});
