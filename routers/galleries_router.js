import { Router } from "express";
import { User } from "../models/users.js";
import { Gallery } from "../models/galleries.js";

export const galleryRouter = Router();

// get galleries by pagination
galleryRouter.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  Gallery.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [{ model: User, attributes: ["username"] }],
  })
    .then(({ count, rows }) => {
      res.status(200).json({
        totalGalleries: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        galleries: rows,
      });
    })
    .catch((err) => {
      console.error("Error fetching galleries:", err);
      res.status(500).json({ error: "Failed to fetch galleries." });
    });
});

// get a gallery by its id
galleryRouter.get("/:galleryId", (req, res) => {
  const galleryId = req.params.galleryId;

  Gallery.findByPk(galleryId, {
    include: [{ model: User, attributes: ["username"] }],
  })
    .then((gallery) => {
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found." });
      }
      res.status(200).json(gallery);
    })
    .catch((err) => {
      console.error("Error fetching gallery:", err);
      res.status(500).json({ error: "Failed to fetch gallery." });
    });
});
