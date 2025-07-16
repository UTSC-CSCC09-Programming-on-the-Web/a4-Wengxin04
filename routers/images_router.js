import { Router } from "express";
import { Image } from "../models/images.js";
import { Gallery } from "../models/galleries.js";
import multer from "multer";
import path from "path";
import { authenticateToken, isGalleryOwner } from "../middleware/auth.js";

const upload = multer({ dest: "uploads/" });
export const imageRouter = Router();

// Upload a new image (only gallery owner)
imageRouter.post(
  "/",
  authenticateToken,
  upload.single("image"),
  isGalleryOwner,
  (req, res) => {
    const { title } = req.body;
    const author = req.user.username;
    const GalleryId = req.body.GalleryId;

    if (!req.file) {
      return res.status(422).json({ error: "Image file is required" });
    }

    if (!title || !GalleryId) {
      return res
        .status(422)
        .json({ error: "Title and galleryId are required" });
    }

    const { mimetype, filename, size } = req.file;

    Image.create({
      title,
      author,
      filename,
      mimetype,
      size,
      GalleryId,
    })
      .then((image) => res.status(200).json(image))
      .catch((err) => {
        res
          .status(500)
          .json({ error: "Failed to create image", details: err.message });
      });
  }
);

// Get images with offset-based pagination
imageRouter.get("/", (req, res) => {
  const limit = parseInt(req.query.limit) || 1;
  const page = parseInt(req.query.page) || 0;
  const offset = Math.max(0, page * limit);

  Image.findAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  })
    .then((images) => res.status(200).json({ images }))
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to fetch images", details: err.message });
    });
});

// Get the total count of images
imageRouter.get("/count", (req, res) => {
  Image.count()
    .then((count) => res.status(200).json({ count }))
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to get image count", details: err.message });
    });
});

// Get metadata of a single image
imageRouter.get("/:id", (req, res) => {
  Image.findByPk(req.params.id)
    .then((image) => {
      if (!image) return res.status(404).json({ error: "Image not found" });
      res.status(200).json(image);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to get image", details: err.message });
    });
});

// Get the index of an image within its gallery
imageRouter.get("/:id/index", (req, res) => {
  const imageId = parseInt(req.params.id);
  if (isNaN(imageId))
    return res.status(422).json({ error: "Invalid image ID" });

  Image.findByPk(imageId)
    .then((targetImage) => {
      if (!targetImage)
        return res.status(404).json({ error: "Image not found" });

      return Image.findAll({
        where: { GalleryId: targetImage.GalleryId },
        order: [["createdAt", "DESC"]],
        attributes: ["id"],
      }).then((galleryImages) => {
        const index = galleryImages.findIndex((img) => img.id === imageId);
        if (index === -1)
          return res
            .status(404)
            .json({ error: "Image not found in this gallery" });
        res.status(200).json({ index });
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to get image index", details: err.message });
    });
});

// Serve image file
imageRouter.get("/:id/file", (req, res) => {
  Image.findByPk(req.params.id)
    .then((image) => {
      if (!image) return res.status(404).json({ error: "Image not found" });

      res.setHeader("Content-Type", image.mimetype);
      res.status(200);
      res.sendFile(
        `uploads/${image.filename}`,
        { root: path.resolve() },
        (err) => {
          if (err) {
            res.status(500).json({
              error: "Failed to send image file",
              details: err.message,
            });
          }
        }
      );
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to get image file", details: err.message });
    });
});

// Delete an image (only gallery owner)
imageRouter.delete("/:id", authenticateToken, (req, res) => {
  Image.findByPk(req.params.id)
    .then((image) => {
      if (!image) return res.status(404).json({ error: "Image not found" });

      Gallery.findByPk(image.GalleryId).then((gallery) => {
        if (!gallery)
          return res.status(404).json({ error: "Gallery not found" });

        if (gallery.UserId !== req.user.id) {
          return res
            .status(403)
            .json({ error: "You do not own this gallery." });
        }

        return image.destroy().then(() => res.status(200).json(image));
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Failed to delete image", details: err.message });
    });
});

// Get images from a specific gallery
imageRouter.get("/gallery/:galleryId", (req, res) => {
  const galleryId = parseInt(req.params.galleryId);
  const limit = parseInt(req.query.limit) || 1;
  const page = parseInt(req.query.page) || 0;
  const offset = Math.max(0, page * limit);

  if (isNaN(galleryId)) {
    return res.status(422).json({ error: "Invalid gallery ID" });
  }

  Image.findAndCountAll({
    where: { GalleryId: galleryId },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  })
    .then(({ count, rows }) =>
      res.status(200).json({ images: rows, totalCount: count })
    )
    .catch((err) => {
      res.status(500).json({
        error: "Failed to fetch gallery images",
        details: err.message,
      });
    });
});
