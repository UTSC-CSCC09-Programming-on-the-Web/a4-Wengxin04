import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Gallery } from "./galleries.js";

export const Image = sequelize.define("Image", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Image.belongsTo(Gallery);
Gallery.hasMany(Image, {
  onDelete: "CASCADE",
});
