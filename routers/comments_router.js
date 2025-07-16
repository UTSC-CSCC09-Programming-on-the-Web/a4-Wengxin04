import { Router } from "express";
import { Comment } from "../models/comments.js";
import { Image } from "../models/images.js";
import {
  authenticateToken,
  isCommentOwnerOrGalleryOwner,
} from "../middleware/auth.js";

export const commentRouter = Router();

// Add a comment to an image (authenticated users only)
commentRouter.post("/images/:id/comments", authenticateToken, (req, res) => {
  const { content } = req.body;
  const author = req.user.username;

  if (!content) {
    return res.status(422).json({ error: "Comment content is required" });
  }

  Image.findByPk(req.params.id)
    .then((image) => {
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      return Comment.create({
        author,
        content,
        ImageId: req.params.id,
      }).then((comment) => res.status(200).json(comment));
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to add comment", details: err.message });
    });
});

// Get comments for an image
commentRouter.get("/images/:id/comments", (req, res) => {
  const imageId = req.params.id;
  const limit = 10;
  const page = parseInt(req.query.page) || 0;
  const offset = page * limit;

  Image.findByPk(imageId)
    .then((image) => {
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }

      Comment.count({ where: { ImageId: imageId } })
        .then((totalCount) => {
          Comment.findAll({
            where: { ImageId: imageId },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
          })
            .then((comments) => res.status(200).json({ comments, totalCount }))
            .catch((err) => {
              res.status(500).json({
                error: "Failed to fetch comments",
                details: err.message,
              });
            });
        })
        .catch((err) => {
          res
            .status(500)
            .json({ error: "Failed to count comments", details: err.message });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Failed to get image for comments",
        details: err.message,
      });
    });
});

// Delete a comment (must be comment owner or gallery owner)
commentRouter.delete(
  "/comments/:commentId",
  authenticateToken,
  isCommentOwnerOrGalleryOwner(Comment),
  (req, res) => {
    Comment.findByPk(req.params.commentId)
      .then((comment) => {
        if (!comment) {
          return res.status(404).json({ error: "Comment not found" });
        }
        return comment.destroy().then(() => res.status(200).json(comment));
      })
      .catch((err) => {
        res
          .status(500)
          .json({ error: "Failed to delete comment", details: err.message });
      });
  }
);
