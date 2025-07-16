import { User } from "../models/users.js";
import { Gallery } from "../models/galleries.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "You are not authenticated." });
  }

  User.findOne({ where: { token } })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Please sign in first." });
      }
      req.user = user;
      req.userId = user.id;
      next();
    })
    .catch((err) => {
      console.error("Auth error:", err);
      res
        .status(500)
        .json({ error: "Internal server error during authentication." });
    });
}

export function isGalleryOwner(req, res, next) {
  const galleryId =
    (req.body && req.body.GalleryId) || req.params.galleryId || req.params.id;

  if (!req.user || !galleryId) {
    return res
      .status(403)
      .json({ error: "Gallery ownership cannot be verified." });
  }

  Gallery.findByPk(galleryId)
    .then((gallery) => {
      if (!gallery) {
        return res.status(404).json({ error: "Gallery not found." });
      }
      if (gallery.UserId !== req.user.id) {
        return res.status(403).json({ error: "You do not own this gallery." });
      }
      req.gallery = gallery;
      next();
    })
    .catch((err) => {
      console.error("Gallery owner check error:", err);
      res.status(500).json({ error: "Internal server error." });
    });
}

export function isCommentOwnerOrGalleryOwner(commentModel) {
  return (req, res, next) => {
    const commentId = parseInt(req.params.commentId);
    if (isNaN(commentId)) {
      return res.status(422).json({ error: "Invalid comment ID" });
    }

    commentModel
      .findByPk(commentId)
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.author === req.user.username) {
          return next();
        }

        return comment.getImage().then((image) => {
          if (!image) {
            return res.status(404).json({ error: "Image not found" });
          }

          return image.getGallery().then((gallery) => {
            if (!gallery) {
              return res.status(404).json({ error: "Gallery not found" });
            }

            if (gallery.UserId === req.user.id) {
              return next();
            }

            return res
              .status(403)
              .json({ error: "You are not allowed to delete this comment." });
          });
        });
      })
      .catch((err) => {
        console.error("Permission check error:", err);
        return res.status(500).json({ error: "Internal server error." });
      });
  };
}
